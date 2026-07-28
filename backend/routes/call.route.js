import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { callLimiter } from "../middlewares/security.middleware.js";
import { getCallHistory } from "../controllers/call.controller.js";
const router = express.Router();
router.get("/", protectRoute, getCallHistory);
router.post("/initiate", protectRoute, callLimiter, (req, res) => res.status(405).json({ message: "Start calls through the authenticated Socket.IO signaling channel" }));
export default router;
