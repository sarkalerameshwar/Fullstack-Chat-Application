import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import { generateToken } from "../lib/utils.js";

// OTP generator function (simple utility)
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP or OTP expired",
      });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        message:
          "OTP verification attempts exceeded. Please request new OTP.",
      });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // ✅ Mark user verified
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // delete OTP after success
    await OTP.deleteOne({ email });

    // ✅ Generate token AFTER verification
    generateToken(updatedUser._id, res);

    res.status(200).json({
      message: "OTP verified successfully",
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profile_Pic,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error verifying OTP",
    });
  }
};


// export const verifyOTPForPasswordReset = async (email, otp) => {
//     try {
//         const otpRecord = await OTP.findOne({ email });

//         if (!otpRecord) {
//             return { success: false, message: "Invalid OTP or OTP expired" };
//         }
//         if (otpRecord.attempts >= 5) {
//             return { success: false, message: "OTP verification attempts exceeded. Please request new OTP." };
//         }
//         if (otpRecord.otp !== otp) {
//             otpRecord.attempts += 1;
//             await otpRecord.save();
//             return { success: false, message: "Invalid OTP" };
//         }
//         await OTP.deleteOne({ email });
//         return { success: true, message: "OTP verified successfully" };
//     } catch (error) {
//         console.log("error in verifyOTPForPasswordReset controller", error.message);
//         return { success: false, message: "Error verifying OTP" };
//     }
// }

