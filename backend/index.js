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
import morgan from "morgan";
import { auditErrors, apiSlowDown, globalLimiter, requestOriginGuard, sanitizeInput, securityHeaders, getAllowedOrigins } from "./middlewares/security.middleware.js";
import logger from "./lib/logger.js";
import { register } from "./lib/metrics.js";
import callRoute from "./routes/call.route.js";

import path from "path";

dotenv.config();
const port = process.env.PORT || 5001;
const __dirname = path.resolve();


app.disable("x-powered-by");
app.use(securityHeaders);
app.use(morgan("combined", { stream: { write: (message) => logger.info("http_request", { message: message.trim() }) } }));
app.use(express.json({ limit: "1mb", type: ["application/json", "application/*+json"] }));
app.use(cookieParser());
app.use(requestOriginGuard, sanitizeInput, globalLimiter, apiSlowDown);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || getAllowedOrigins().includes(origin)) {
        return callback(null, true);
      }
      callback(null, true);
    },
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
app.get("/api/metrics", async (req, res) => { res.set("Content-Type", register.contentType); res.end(await register.metrics()); });

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoutes);
app.use("/api", searchRoute);
app.use("/api", requestRoute);
app.use("/api/calls", callRoute);


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

app.use(auditErrors);

export { app, server };

