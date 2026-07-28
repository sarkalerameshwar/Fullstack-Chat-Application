import { generateToken, hashToken } from "../lib/utils.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import cloudinary from "../lib/cloudinary.js";
import { generateOTP } from "./otp.controller.js";
import OTP from "../models/otp.model.js";
import { sendEmail } from "../lib/email.service.js";

export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

  try {

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if(existingUser && !existingUser.isVerified){
      await OTP.deleteMany({ email });
      await User.deleteOne({email });
    }

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email: normalizedEmail,
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

export const resendOTP = async (req, res) => {
  try{
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
      });
    }
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });
    await sendEmail(email, "Your OTP Code", `Your OTP code is: ${otp}`);
    res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (err) {
    console.log("error in resendOTP controller", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (user.lockUntil && user.lockUntil > new Date()) return res.status(429).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) { user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); user.failedLoginAttempts = 0; }
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.failedLoginAttempts = 0; user.lockUntil = undefined;
    const { refreshToken } = generateToken(user._id, res);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    res.status(200).json({
      "message": "Login successful",
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
    if (req.user) { req.user.refreshTokenHash = undefined; await req.user.save(); }
    res.clearCookie("jwt");
    res.clearCookie("refresh_token", { path: "/api/auth" });

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

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    if (payload.type !== "refresh") throw new Error("Invalid refresh token");
    const user = await User.findById(payload.userId);
    if (!user || user.refreshTokenHash !== hashToken(token)) throw new Error("Refresh token replayed");
    const { refreshToken } = generateToken(user._id, res);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
    res.json({ message: "Session refreshed" });
  } catch { res.status(401).json({ message: "Session expired" }); }
};

export const forgotPassword = async (req, res) =>{
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if(!user){
      return res.status(400).json({
        message: "User with this email does not exist",
      });
    }
    const otp = generateOTP();

    await OTP.deleteMany({ email });

    await OTP.create({ email, otp });

    await sendEmail(email, "Your OTP Code for Password Reset", `Your OTP code is: ${otp}`);

    res.status(200).json({
      message: "OTP sent to your email for password reset.",
    });

  } catch (err) {
    console.log("error in forgotPassword controller", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const resetPasswordOTPVerify = async (req, res) =>{
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP or OTP expired",
      });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    
    await OTP.deleteMany({ email });

    res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (err) {
    console.log("error in resetPasswordOTPVerify controller", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const resetPassword = async (req, res) => {
  try{
    const { email, newPassword } = req.body;

    if(newPassword.length < 6){
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    res.status(200).json({
      message: "Password reset successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log("error in resetPassword controller", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

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

export const googleLogin = async (req, res) => {
  const { email, name, picture } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required for Google authentication" });
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      user = await User.create({
        username: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: randomPassword,
        profile_Pic: picture || "",
        isVerified: true,
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      if (picture && !user.profile_Pic) user.profile_Pic = picture;
      await user.save();
    }

    const { refreshToken } = generateToken(user._id, res);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    res.status(200).json({
      message: "Google login successful",
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profile_Pic,
    });
  } catch (err) {
    console.log("error in googleLogin controller", err.message);
    res.status(500).json({ message: "Internal server error" });
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
