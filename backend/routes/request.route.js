import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  cancelFriendRequest,
  respondToFriendRequest,
  sendFriendRequest,
  rejectFriendRequest,
} from "../controllers/request.controller.js";

const router = express.Router();

router.post("/users/friend-request", protectRoute, sendFriendRequest);

router.post("/users/:id/accept-friend-request", protectRoute, respondToFriendRequest);
router.post("/users/:id/reject-friend-request", protectRoute, rejectFriendRequest);
router.delete("/users/:id/delete-friend-request",protectRoute,cancelFriendRequest);

export default router;
