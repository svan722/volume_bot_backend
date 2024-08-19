// Load Constants
import { WETH_TOKEN, AIA_TOKEN } from "../constants/uniswap";
import { ConfigType } from "../constants/types";
import { fees } from "../constants/fee";
import { tokens } from "../constants/tokens";

export const UniswapConfig: ConfigType = {
  rpc: {
    local: "https://base-sepolia-rpc.publicnode.com",
    mainnet: "https://mainnet.base.org",
  },
  tokens: [
    {
      in: WETH_TOKEN,
      amountIn: 0.5,
      out: AIA_TOKEN,
      poolFee: fees.MEDIUM,
    },
    {
      in: AIA_TOKEN,
      amountIn: 1000,
      out: WETH_TOKEN,
      poolFee: fees.MEDIUM,
    },
  ],
};

export const OrcaConfig: ConfigType = {
  rpc: {
    local: "https://api.devnet.solana.com",
    mainnet: "https://api.mainnet-beta.solana.com",
  },
  tokens: [
    {
      in: tokens["SOL"].address,
      amountIn: 0.5,
      out: tokens["AIX"].address,
      poolFee: fees.MEDIUM,
    },
    {
      in: tokens["AIX"].address,
      amountIn: 1000,
      out: tokens["SOL"].address,
      poolFee: fees.MEDIUM,
    },
  ],
};
