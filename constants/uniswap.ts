// Load Uniswap SDK
import { ChainId, Token } from "@uniswap/sdk-core";

// Load Token Constants
import { tokens } from "./tokens";

export const WETH_TOKEN = new Token(
  ChainId.BASE,
  tokens["WETH"].address,
  tokens["WETH"].decimals,
  tokens["WETH"].symbol,
  tokens["WETH"].name
);

export const AIA_TOKEN = new Token(
  ChainId.BASE,
  tokens["AIA"].address,
  tokens["AIA"].decimals,
  tokens["AIA"].symbol,
  tokens["AIA"].name
);

export const SWAP_ROUTER_CONTRACT =
  "0x2626664c2603336e57b271c5c0b26f421741e481";

export const FACTORY_ADDRESS = "0x33128a8fc17869897dce68ed026d694621f6fdfd";

export const QUOTER_CONTRACT = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
