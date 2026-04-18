import User from '../models/user.model.js';
import FriendRequest from '../models/friend.request.model.js';


export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.body;

        // Check if users exist
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        if(senderId.toString() === receiverId){
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            senderId: senderId,
            receiverId: receiverId
        });

        if(existingRequest && existingRequest.status === "pending"){
            return res.status(400).json({ message: "Friend request already sent and pending" });
        }

        if(existingRequest && existingRequest.status === "accepted"){
            return res.status(400).json({ message: "You are already friends" });
        }

        // Create new friend request
        const friendRequest = new FriendRequest({
            senderId: senderId,
            receiverId: receiverId
        });

        await friendRequest.save();
        res.status(201).json({ message: "Friend request sent" });
    } catch (error) {
        res.status(500).json({ message: "Error sending friend request", error });
    }
}

export const respondToFriendRequest = async (req, res) => {
    try{
        const receiverId = req.user._id;
        const { senderId, action } = req.body;

        // Validate action
        if(!["accept", "reject"].includes(action)){
            return res.status(400).json({ message: "Invalid action. Must be 'accept' or 'reject'" });
        }
        // Find the friend request
        const friendRequest = await FriendRequest.findOne({
            senderId: senderId,
            receiverId: receiverId,
            status: "pending"
        });

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Update the friend request status
        friendRequest.status = action === "accept" ? "accepted" : "rejected";
        await friendRequest.save();

        res.json({ message: `Friend request ${action === "accept" ? "accepted" : "rejected"}` });

    } catch (error) {
        res.status(500).json({ message: "Error responding to friend request", error });

    }
}

export const getFriendRequests = async (req, res) => {
    try{
        const userId = req.user._id;

        const friendRequests = await FriendRequest.find({
            receiverId: userId,
            status: "pending"
        }).populate("senderId", "username profile_Pic");
        res.json({ friendRequests });
    } catch (error) {
        res.status(500).json({ message: "Error fetching friend requests", error });

    }
}

export const cancelFriendRequest = async (req, res) => {
    try{
        const senderId = req.user._id;
        const { receiverId } = req.body;

        const friendRequest = await FriendRequest.findOneAndDelete({
            senderId: senderId,
            receiverId: receiverId,
            status: "pending"
        });
        if(!friendRequest){
            return res.status(404).json({ message: "Friend request not found or already processed" });
        }
    
        res.json({ message: "Friend request cancelled" });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling friend request", error });

    }
}

export const getFriendsList = async (req, res) => {
    try{
        const userId = req.user._id;
        
        // Find all accepted friend requests where user is sender or receiver
        const friendRequests = await FriendRequest.find({
            $or: [
                { senderId: userId, status: "accepted" },
                { receiverId: userId, status: "accepted" }
            ]
        }).populate("senderId receiverId", "username profile_Pic");
        
        // Extract friend objects (the other person in each friendship)
        // and skip malformed/deleted references to avoid runtime crashes.
        const friends = friendRequests
            .map((request) => {
                const sender = request.senderId;
                const receiver = request.receiverId;

                if (!sender || !receiver) return null;

                if (sender._id?.toString() === userId.toString()) {
                    return receiver;
                }

                return sender;
            })
            .filter(Boolean);

        // De-duplicate by user id to keep the response stable.
        const uniqueFriendsMap = new Map();
        for (const friend of friends) {
            uniqueFriendsMap.set(friend._id.toString(), friend);
        }
        const uniqueFriends = Array.from(uniqueFriendsMap.values());
        
        res.json({ friends: uniqueFriends });
    } catch (error) {
        res.status(500).json({ message: "Error fetching friends list", error });
    }
}

export const rejectFriendRequest = async (req, res) => {
    try{
        const receiverId = req.user._id;
        const { senderId } = req.body;

        const friendRequest = await FriendRequest.findOneAndUpdate(
            { senderId: senderId, receiverId: receiverId, status: "pending" },
            { status: "rejected" },
            { new: true }
        );
        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }
        res.json({ message: "Friend request rejected" });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting friend request", error });

    }
}

export const getSentFriendRequests = async (req, res) => {
    try{
        const userId = req.user._id;

        const sentRequests = await FriendRequest.find({
            senderId: userId,
            status: "pending"
        }).populate("receiverId", "username profile_Pic");
        res.json({ sentRequests });
    } catch (error) {
        res.status(500).json({ message: "Error fetching sent requests", error });

    }
}