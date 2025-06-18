import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";


dotenv.config();
const port = process.env.PORT || 5001;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(port, (req, res) => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});
