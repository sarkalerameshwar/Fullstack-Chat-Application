import jwt from 'jsonwebtoken';
import crypto from "crypto";

export const generateToken = (userId, res) =>{
    const token = jwt.sign({ userId, type: "access" }, process.env.JWT_SECRET, { expiresIn : "15m" });
    const refreshToken = jwt.sign({ userId, type: "refresh", jti: crypto.randomUUID() }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn : "7d" });
    const secure = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
        maxAge : 15 * 60 * 1000 ,
        httpOnly : true ,
        secure,
        sameSite : "lax",
    });
    res.cookie("refresh_token", refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure, sameSite: "lax", path: "/api/auth" });
    return { token, refreshToken };
}

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
