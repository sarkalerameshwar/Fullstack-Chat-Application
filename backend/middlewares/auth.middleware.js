import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) =>{
    try{
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message : "Unauthosized - Invalid Token"});

        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(404).json({message : "User not found"});
        }

        req.user = user;

        next();
    }catch(err){
        console.log(err.message);
        res.status(500).json({messaage : "Internal server error"});
    }
}
