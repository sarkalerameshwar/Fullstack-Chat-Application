import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () =>{
    try {
        // console.log("DB_URL:", process.env.DB_URL);
        await mongoose.connect(process.env.DB_URL);
        console.log('connection successful.');
    }catch(err){
        console.log(err);
    }
}
