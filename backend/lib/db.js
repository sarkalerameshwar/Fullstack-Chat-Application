import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        const mongoUri = process.env.DB_URL;
        await mongoose.connect(mongoUri);
        console.log('connection successful.');
    } catch (err) {
        console.log(err);
    }
}
