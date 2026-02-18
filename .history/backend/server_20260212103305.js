import cookieParser from "cookie-parser";
import express from "express";

import dotenv from "dotenv";
import connectDB from "./src/db/db.js";
import UserRouter from "./src/routes/authRoute.js";
import MusicRouter from "./src/routes/musicRoute.js";
import connectCloudinary from "./src/services/Storage.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Database connect
await connectDB();
await connectCloudinary();
// Middleware
app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", UserRouter);
app.use("/api/music", MusicRouter)



app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Server start
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
