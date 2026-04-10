import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getUsersForSidebar, getMessage, sendMessage } from "../controllers/message.controller.js";
import { getFriendsList } from "../controllers/request.controller.js";
import { chatMiddleware } from "../middlewares/chat.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getFriendsList);

router.get("/:id", protectRoute, chatMiddleware, getMessage);

router.post("/send/:id", protectRoute, chatMiddleware, sendMessage);

export default router;
