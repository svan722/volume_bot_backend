// Load Uniswap SDK Core
import { Token } from "@uniswap/sdk-core";

export interface ConfigType {
  rpc: {
    local: string;
    mainnet: string;
  };
  tokens: SingleTokenType[];
}

export interface SingleTokenType {
  in: Token | string;
  amountIn: number;
  out: Token | string;
  poolFee: number;
}

export interface TokenType {
  [symbol: string]: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
}

export interface PairType {
  [symbol: string]: {
    name: string;
    address: string;
  };
}
