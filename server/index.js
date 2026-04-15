import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import chatRoute from "./routes/chat.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRoute);

app.listen(5001, () => console.log("🚀 Server running on http://localhost:5001"));