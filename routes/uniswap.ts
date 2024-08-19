import express from "express";
import { runBotWithUniswap } from "../controllers/uniswap";

const router = express.Router();

router.post("/run-bot", runBotWithUniswap);

export default router;
