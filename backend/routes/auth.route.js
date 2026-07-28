import express from 'express'
import { login, logout, forgotPassword, resetPassword, resendOTP,resetPasswordOTPVerify, signup, updateProfile, authCheck, refresh } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { verifyOTP } from '../controllers/otp.controller.js';
import { forgotLimiter, loginLimiter, otpLimiter, registerLimiter } from "../middlewares/security.middleware.js";
import { schemas, validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post("/signup", registerLimiter, validate(schemas.signup), signup)

router.post("/login", loginLimiter, validate(schemas.credentials), login)

router.post("/verify-otp", otpLimiter, validate(schemas.otp), verifyOTP)

router.post("/resend-otp", otpLimiter, resendOTP)

router.post("/forgot-password", forgotLimiter, (req, res, next) => { req.body.password = "not-used-password"; next(); }, validate(schemas.credentials.pick({ email: true })), forgotPassword);

router.post("/verify-reset-otp", otpLimiter, validate(schemas.otp), resetPasswordOTPVerify);

router.post("/reset-password", resetPassword);

router.post("/refresh", refresh)
router.post("/logout", protectRoute, logout)

router.put("/update-profile",protectRoute, updateProfile);

router.get("/check", protectRoute, authCheck);

export default router;
