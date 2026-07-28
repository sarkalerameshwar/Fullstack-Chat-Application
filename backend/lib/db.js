import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        const mongoUri = process.env.DB_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chat_db";
        await mongoose.connect(mongoUri);
        console.log('connection successful.');
    } catch (err) {
        console.log(err);
    }
}
