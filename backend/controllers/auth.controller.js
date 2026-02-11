import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { generateOTP } from "./otp.controller.js";
import OTP from "../models/otp.model.js";
import { sendEmail } from "../lib/email.service.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    // ✅ Generate OTP
    const otp = generateOTP();

    await OTP.deleteMany({ email });

    await OTP.create({ email, otp });

    await sendEmail(email, "Your OTP Code", `Your OTP code is: ${otp}`);

    res.status(201).json({
      message: "Signup successful. Please verify your email using OTP.",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email before logging in",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profile_Pic,
    });

  } catch (err) {
    console.log("error in login controller", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0, httpOnly: true });

    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (err) {
    console.log("error in logout controller", err.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {

    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({
        message: "Profile pic required",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile_Pic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);

  } catch (err) {
    console.log("error in update profile", err);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const authCheck = (req, res) => {
  try {

    res.status(200).json(req.user);

  } catch (err) {

    console.log("error in checkAuth controller", err.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
