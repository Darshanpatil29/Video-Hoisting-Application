import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT=asyncHandler(async(req,_,next)=>{
       try {
        const token =await req.cookies ? req.cookies.accessToken : req.header("Authorization")?.replace("Bearer ", "");
     
        if(!token){
         throw new ApiError(401,"Unauthorize request!!");
        }
        const decodeToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodeToken?._id).select("-password -refreshToken -passwordResetToken");
        if(!user){
         throw new ApiError(401,"Invalid access");
        }
     
        req.user=user;
        next();
       } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
       }

});