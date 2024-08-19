import { Request, Response } from "express";

// Load Feature
import { createSwap } from "../features/orca";

// Load Utils
import { random, random_ } from "../utils/random";
import { sleep } from "../utils/sleep";

let timerId: NodeJS.Timeout | null = null;

export const runBotWithOrca = async (req: Request, res: Response) => {
  try {
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
        console.log("Orca Interval");

        await createSwap("buy", buyAmountIn);
        await sleep(10000);
        await createSwap("sell", sellAmountIn);
      }
    }, between * 1000);

    return res.status(200).json("Bot is updated");
  } catch (error) {
    console.log("Internal Server Error While Running A Bot With Orca: ", error);
    return res.status(500).json(error);
  }
};
