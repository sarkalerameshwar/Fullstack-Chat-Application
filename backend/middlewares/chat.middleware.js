import FriendRequest from "../models/friend.request.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";


export const chatMiddleware = async (req, res, next) => {
    try {
        const senderId = req.user._id;
        const { id } = req.params;

        const receiverId = id;

        // Check if trying to chat with self
        if (senderId.toString() === receiverId) {
            return res.status(400).json({ 
                message: "You cannot chat with yourself" 
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        // Check if users are friends (accepted request exists)
        const validRelationship = await FriendRequest.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId, status: "accepted" },
                { senderId: receiverId, receiverId: senderId, status: "accepted" }
            ]
        });

        if (!validRelationship) {
            return res.status(403).json({ 
                message: "You are not friends with this user. Please send a friend request first." 
            });
        }

        // Optional: Attach relationship to req for later use
        req.relationship = validRelationship;
        next();
        
    } catch (error) {
        console.error("Chat middleware error:", error);
        res.status(500).json({ 
            message: "Error validating friendship", 
            error: error.message 
        });
    }
};

