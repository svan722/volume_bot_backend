// Importing module
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config();

// set cors
app.use(cors());

// set parser
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Load Routers
import uniswapRouter from "./routes/uniswap";
import orcaRouter from "./routes/orca";

// Set up Routers
app.use("/uniswap", uniswapRouter);
app.use("/orca", orcaRouter);

// Handling GET / Request
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to bot backend!");
});

// Server setup
app.listen(PORT, () => {
  console.log("The bot is running " + "on port http://localhost:" + PORT);
});
