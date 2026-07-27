import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import searchRoute from "./routes/search.route.js";
import requestRoute from "./routes/request.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

import path from "path";

dotenv.config();
const port = process.env.PORT || 5001;
const __dirname = path.resolve();


app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoutes);
app.use("/api", searchRoute);
app.use("/api", requestRoute);


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
  });
}

export { app, server };

