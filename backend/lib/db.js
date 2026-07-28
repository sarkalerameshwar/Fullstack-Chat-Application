import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        const mongoUri = process.env.DB_URL || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("Missing DB_URL or MONGODB_URI environment variable");
        }
        await mongoose.connect(mongoUri);
        console.log('connection successful.');
    } catch (err) {
        console.log(err);
    }
}
