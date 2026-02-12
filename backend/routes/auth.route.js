import express from 'express'
import { login, logout, forgotPassword, resetPassword, resendOTP, signup, updateProfile, authCheck } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { verifyOTP } from '../controllers/otp.controller.js';

const router = express.Router();

router.post("/signup", signup)

router.post("/login", login)

router.post("/verify-otp", verifyOTP)

router.post("/resend-otp", resendOTP)

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.post("/logout", logout)

router.put("/update-profile",protectRoute, updateProfile);

router.get("/check", protectRoute, authCheck);

export default router;