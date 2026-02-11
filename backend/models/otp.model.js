import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    otp:{
        type: String,
        required: true,
    },
    expiresAt:{
        type: Date,
        required: true,
        default: () => Date.now() + 10 * 60 * 1000, // 10 minutes from now
    },
    attempts:{
        type: Number,
        default: 0,
    },
},
{
    timestamps : true
}
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
