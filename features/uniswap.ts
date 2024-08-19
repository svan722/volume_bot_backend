// Load Ethers
import { Wallet, ethers } from "ethers";

// Load Uniswap SDK
import { ChainId } from "@uniswap/sdk-core";
import { SWAP_ROUTER_02_ADDRESSES } from "@uniswap/sdk-core";

// Load Uniswap V3 ABIs
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

// Load Config
import { UniswapConfig } from "../config/config";

// Load Constants
import { pairs, tokens } from "../constants/tokens";
import { AIA_ABI } from "../constants/abis/AIA"; // Token Contract ABI
import { SWAP_ROUTER_ABI } from "../constants/abis/UniswapV3Router"; // Uniswap V3 Router Contract ABI
import { FACTORY_ABI } from "../constants/abis/UniswapV3Factory"; // Uniswap V3 Factory Contract ABI
import { QUOTER_CONTRACT } from "../constants/uniswap";
import { Quoter_ABI } from "../constants/abis/Quoter";
import { WETH_ABI } from "../constants/abis/WETH";

// Create a provider
export const provider = new ethers.JsonRpcProvider(UniswapConfig.rpc.mainnet);
export const signer = new ethers.Wallet(
  process.env.PRIVATE_KEY || "",
  provider
);
export const swapRouter = new ethers.Contract(
  SWAP_ROUTER_02_ADDRESSES(ChainId.BASE),
  SWAP_ROUTER_ABI,
  signer
);
export const factoryContract = new ethers.Contract(
  "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
  FACTORY_ABI,
  provider
);

// Get a pool contract
export const getPoolContractInfo = async () => {
  try {
    const poolContract = new ethers.Contract(
      pairs["AIA_WETH"].address,
      IUniswapV3PoolABI.abi,
      provider
    );

    const [token0, token1, fee, liquidity, slot0] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.liquidity(),
      poolContract.slot0(),
    ]);

    return { poolContract, token0, token1, fee, liquidity, slot0 };
  } catch (error) {
    console.log("Internal Server Error: ", error);
  }
};

// Approve Token
export const approveToken = async (
  type: string,
  address: string,
  amount: BigInt,
  wallet: Wallet
) => {
  try {
    const tokenContract = new ethers.Contract(
      address,
      type === "buy" ? WETH_ABI : AIA_ABI
    );

    const approveTransaction = await tokenContract.approve.populateTransaction(
      SWAP_ROUTER_02_ADDRESSES(ChainId.BASE),
      amount
    );

    const transactionResponse = await wallet.sendTransaction(
      approveTransaction
    );
    console.log(`-------------------------------`);
    console.log(`Sending Approval Transaction...`);
    console.log(`-------------------------------`);
    console.log(`Transaction Sent: ${transactionResponse.hash}`);
    console.log(`-------------------------------`);
    const receipt = await transactionResponse.wait();
    console.log(
      `Approval Transaction Confirmed! https://basescan.org/tx/${receipt?.hash}`
    );
  } catch (error) {
    console.log("Internal Server Error: ", error);
  }
};

// Fetch Quote
export const quoteAndLogSwap = async (
  token0: string,
  token1: string,
  fee: number,
  amountIn: string
) => {
  try {
    const quoterContract = new ethers.Contract(
      QUOTER_CONTRACT,
      Quoter_ABI,
      provider
    );

    const quotedAmountOut =
      await quoterContract.quoteExactInputSingle.staticCall({
        tokenIn: token0,
        tokenOut: token1,
        fee: fee,
        recipient: signer.address,
        deadline: Math.floor(new Date().getTime() / 1000 + 60 * 10),
        amountIn: amountIn,
        sqrtPriceLimitX96: 0,
      });

    console.log(`-------------------------------`);
    console.log(
      `Token Swap will result in: ${ethers.formatUnits(
        quotedAmountOut[0].toString(),
        tokens["AIA"].decimals
      )} ${tokens["AIA"].symbol} for ${ethers.formatEther(amountIn)} ${
        tokens["WETH"].address
      }`
    );

    return quotedAmountOut[0].toString();
  } catch (error) {
    console.log("Internal Server Error: ", error);
  }
};

// Create a Swap Tx
export const createSwap = async (
  token0: string,
  token1: string,
  fee: number,
  amountIn: string,
  amountOut: string
) => {
  try {
    const params = {
      tokenIn: token0,
      tokenOut: token1,
      fee: fee,
      recipient: signer.address,
      amountIn: amountIn,
      amountOutMinimum: amountOut,
      sqrtPriceLimitX96: 0,
    };

    const transaction = await swapRouter.exactInputSingle.populateTransaction(
      params
    );
    const receipt = await signer.sendTransaction(transaction);
    console.log(`-------------------------------`);
    console.log(`Receipt: https://basescan.org/tx/${receipt.hash}`);
    console.log(`-------------------------------`);
  } catch (error) {
    console.log("Internal Server Error : ", error);
  }
};
