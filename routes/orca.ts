import express from "express";
import { runBotWithOrca } from "../controllers/orca";

const router = express.Router();

router.post("/run-bot", runBotWithOrca);

export default router;
