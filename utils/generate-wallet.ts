import web3 from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

let secretKey = bs58.decode(process.env.SOLANA_PK || "replace with your pk");
const unit8Array = web3.Keypair.fromSecretKey(secretKey).secretKey;
const regularArray = Array.from(unit8Array);

const jsonString = JSON.stringify(regularArray, null, 2);

const filePath = "./constants/wallet/wallet.json";

fs.writeFileSync(filePath, jsonString);
