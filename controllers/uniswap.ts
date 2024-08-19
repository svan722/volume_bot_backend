import { Request, Response } from "express";

// Load Ethers Module
import { ethers } from "ethers";

// Load Uniswap Feature APIs
import {
  approveToken,
  createSwap,
  getPoolContractInfo,
  quoteAndLogSwap,
  signer,
} from "../features/uniswap";

// Load Utils
import { random, random_ } from "../utils/random";
import { sleep } from "../utils/sleep";

// Load Constants
import { tokens } from "../constants/tokens";

let timerId: NodeJS.Timeout | null = null;

export const runBotWithUniswap = async (req: Request, res: Response) => {
  const isEnabled = req.body.isEnabled;
  const min_buy = req.body.min_buy;
  const max_buy = req.body.max_buy;
  const min_sell = req.body.min_sell;
  const max_sell = req.body.max_sell;
  const min_between = req.body.min_between;
  const max_between = req.body.max_between;

  if (
    min_buy == 0 ||
    max_buy == 0 ||
    min_sell == 0 ||
    max_sell == 0 ||
    min_between == 0 ||
    max_between == 0
  ) {
    return res.status(400).json("Bad Configuration");
  }

  const buyAmountIn = random(min_buy, max_buy, 4);
  const sellAmountIn = random(min_sell, max_sell, 0);
  const between = random_(min_between, max_between);

  if (!isEnabled && timerId) {
    clearInterval(timerId);
    timerId = null;
    console.log("Bot Stopped");

    return res.status(201).json("Bot is stopped");
  }

  timerId = setInterval(async () => {
    if (isEnabled) {
      // Run Bot
      console.log("Uniswap Interval");
      await runBotWithType("buy", buyAmountIn);
      await sleep(10000);
      await runBotWithType("sell", sellAmountIn);
    }
  }, between * 1000);

  return res.status(200).json("Bot is updated");
};

export const runBotWithType = async (type: string, inputAmount: string) => {
  try {
    const decimals =
      type === "buy" ? tokens["WETH"].decimals : tokens["AIA"].decimals;
    const amountIn = ethers.parseUnits(inputAmount.toString(), decimals);

    const poolInfo = await getPoolContractInfo();

    if (
      !poolInfo ||
      !poolInfo.poolContract ||
      !poolInfo.token0 ||
      !poolInfo.token1 ||
      !poolInfo.fee
    )
      return false;

    await approveToken(
      type,
      type === "buy" ? poolInfo.token0 : poolInfo.token1,
      amountIn,
      signer
    );

    const quotedAmountOut = await quoteAndLogSwap(
      type === "buy" ? poolInfo.token0 : poolInfo.token1,
      type === "buy" ? poolInfo.token1 : poolInfo.token0,
      poolInfo.fee,
      amountIn.toString()
    );

    if (!quotedAmountOut) return false;

    await createSwap(
      type === "buy" ? poolInfo.token0 : poolInfo.token1,
      type === "buy" ? poolInfo.token1 : poolInfo.token0,
      poolInfo.fee,
      amountIn.toString(),
      quotedAmountOut
    );

    return true;
  } catch (error) {
    console.log(
      "Internal Server Error While Running A Bot With Uniswap: ",
      error
    );
    return false;
  }
};
