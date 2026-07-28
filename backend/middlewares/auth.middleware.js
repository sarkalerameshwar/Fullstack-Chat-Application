import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) =>{
    try{
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message : "Unauthosized - Invalid Token"});

        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== "access") return res.status(401).json({ message: "Invalid token" });

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(404).json({message : "User not found"});
        }

        req.user = user;

        next();
    }catch(err){
        res.status(401).json({message : "Unauthorized"});
    }
}

export const requireRole = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: "Insufficient permissions" });
