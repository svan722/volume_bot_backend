// Load Solana Web3
import {
  ComputeBudgetProgram,
  PublicKey,
} from "@solana/web3.js";

// Load Anchor Provider
import { AnchorProvider } from "@coral-xyz/anchor";

// Load Orca SDK
import { DecimalUtil, Percentage } from "@orca-so/common-sdk";
import {
  WhirlpoolContext,
  buildWhirlpoolClient,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PDAUtil,
  swapQuoteByInputToken,
  IGNORE_CACHE,
} from "@orca-so/whirlpools-sdk";

// Load Number JS Modules
import Decimal from "decimal.js";
import { tokens } from "../constants/tokens";

// Load Constants
import { MAINNET_WHIRLPOOL_CONTRACT } from "../constants/orca";

export const createSwap = async (type: string, amount: string) => {
  try {
    // Create WhirlpoolClient
    const provider = AnchorProvider.env();

    const ctx = WhirlpoolContext.withProvider(
      provider,
      ORCA_WHIRLPOOL_PROGRAM_ID
    );

    const client = buildWhirlpoolClient(ctx);

    // WhirlpoolsConfig account
    const MAINNET_WHIRLPOOLS_CONFIG = new PublicKey(MAINNET_WHIRLPOOL_CONTRACT);

    // Mainnet
    const tick_spacing = 256;

    const whirlpool_pubkey = PDAUtil.getWhirlpool(
      ORCA_WHIRLPOOL_PROGRAM_ID,
      MAINNET_WHIRLPOOLS_CONFIG,
      new PublicKey(tokens["SOL"].address),
      new PublicKey(tokens["AIX"].address),
      tick_spacing
    );

    // Get Pool
    const whirlpool = await client.getPool(whirlpool_pubkey.publicKey);

    const inToken = type === "buy" ? tokens["SOL"] : tokens["AIX"];
    const outToken = type === "buy" ? tokens["AIX"] : tokens["SOL"];
    const amount_in = new Decimal(amount /* SOL */);

    console.log({ inToken, amount_in });

    // Obtain swap estimation (run simulation)
    const quote = await swapQuoteByInputToken(
      whirlpool,
      // Input token and amount
      new PublicKey(inToken.address),
      DecimalUtil.toBN(amount_in, inToken.decimals),
      Percentage.fromFraction(10, 1000),
      ctx.program.programId,
      ctx.fetcher,
      IGNORE_CACHE
    );

    const estimated_compute_units = 200_000; // ~ 1_400_000 CU
    const additional_fee_in_lamports = 100_000; // 0.0001 SOL

    const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      // Specify how many micro lamports to pay in addition for 1 CU
      microLamports: Math.floor(
        (additional_fee_in_lamports * 1_000_000) / estimated_compute_units
      ),
    });
    const set_compute_unit_limit_ix = ComputeBudgetProgram.setComputeUnitLimit({
      // To determine the Solana network fee at the start of the transaction, explicitly specify CU
      // If not specified, it will be calculated automatically. But it is almost always specified
      // because even if it is estimated to be large, it will not be refunded
      units: estimated_compute_units,
    });

    // Send the transaction
    const tx = await whirlpool.swap(quote);

    tx.prependInstruction({
      instructions: [set_compute_unit_limit_ix, setComputeUnitPriceIx],
      cleanupInstructions: [],
      signers: [],
    });

    try {
      const signature = await tx.buildAndExecute();

      // Wait for the transaction to complete
      const latest_blockhash = await ctx.connection.getLatestBlockhash();
      await ctx.connection.confirmTransaction(
        { signature, ...latest_blockhash },
        "confirmed"
      );
      console.log("Transaction Confirmed!");
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  } catch (error) {
    console.log("Internal Server Error: ", error);
    return false;
  }
};
