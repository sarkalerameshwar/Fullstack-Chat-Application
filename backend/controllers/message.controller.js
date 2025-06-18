import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedIdUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedIdUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (err) {
    console.log("error in getUsersForSidebar", err.message);
    res.status(500).json({ err: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: userChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: userChatId },
        { senderId: userChatId, recieverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (err) {
    console.log("error in getMessage controller : ", err.message);
    res.status(500).json({ err: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } catch (uploadErr) {
        console.log("Cloudinary upload error:", uploadErr.message);
        return res.status(500).json({ err: "Image upload failed" });
      }
    }

    const newMessage = new Message({
      senderId,
      recieverId: receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.log("error in sendMessage controller: ", err.message);
    res.status(500).json({ err: "Internal server error" });
  }
};
