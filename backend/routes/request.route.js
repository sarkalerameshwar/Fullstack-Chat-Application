import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  cancelFriendRequest,
  respondToFriendRequest,
  sendFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriendsList,
  getSentFriendRequests,
} from "../controllers/request.controller.js";

const router = express.Router();

// Send friend request
router.post("/users/friend-request", protectRoute, sendFriendRequest);

// Get all received friend requests
router.get("/users/friend-requests", protectRoute, getFriendRequests);

// Get all sent friend requests (for checking request status)
router.get("/users/sent-friend-requests", protectRoute, getSentFriendRequests);

// Get friends list
router.get("/users/friends-list", protectRoute, getFriendsList);

// Accept friend request
router.post("/users/:id/accept-friend-request", protectRoute, respondToFriendRequest);

// Reject friend request
router.post("/users/:id/reject-friend-request", protectRoute, rejectFriendRequest);

// Cancel/Delete sent friend request
router.delete("/users/:id/delete-friend-request", protectRoute, cancelFriendRequest);

export default router;
