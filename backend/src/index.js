import express from "express";
import dotenv from "dotenv";
import path from "path";
import DBConnection from "./config/db.js";
import RedisConnection, { redisClient } from "./config/redis.js";
import connectCloudinary from "./config/cloudinary.js";
import cookieparser from "cookie-parser";
import { fileURLToPath } from "url";

import authRouter from "./routes/authRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import cors from "cors";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieparser());
app.use("/auth", authRouter);
app.use("/order", orderRouter);

async function InitializeConnection() {
  console.log("Starting Connection!");

  try {
    await Promise.all([DBConnection(), RedisConnection(), connectCloudinary()]);
    console.log("Connection to Mongo, Cloudinary and Redis Established!");

    app.listen(process.env.PORT, () => {
      console.log(`Server listening on Port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("CRITICAL: Initialization failed. Server did not start.");
    console.error(error);
    process.exit(1);
  }
}

InitializeConnection();

app.get("/", (req, res) => {
  res.send("Hello from Anirudh");
});
