import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadFile} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from 'fs';
import mongoose from "mongoose";
import { channel } from "diagnostics_channel";

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user = await User.findOne(userId);
        const accessToken= await user.generateAccessToken()
        const refreshToken=await user.generateRefreshToken()
        user.refreshToken=await refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(400,error)
    }
}


const registerUser=asyncHandler(async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })

    // steps to register user:

    // 1.get all user details from frontend. //
    // 2.validation (password,not empty,format of email or number,etc).//
    // 3.check if user already exist.(using email or username) // 
    // 4.check if files present or not.(check for images and avatar).//
    // 5.upload them to cloudinary//
    // 6.crete user object - create entry in db //
    // 7.remove password and refresh token field from response //
    // 8.check for user creation //
    // 9.return response //

    // 1.get all user details from frontend.
    const {fullname,username,email,password} =req.body

    // 2.validation (password,not empty,format of email or number,etc).
    if([fullname,email,username,password].some((field)=>{
        if(field.trim()===""){
            return true;
        }
    })){
        throw new ApiError(400,"All Fields are required")
    }

    if(!(email.includes("@"))){
        return new ApiError(400,"Enter valid email")
    }

    //3.check if user already exist.(using email or username) 
    const existedUser=await User.findOne({
        $or:[{email}, {username}]
    });

    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    // 4.check if files present or not.(check for images and avatar).
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files.coverImage[0].path;
    console.log(avatarLocalPath);
    // if(!avatarLocalPath){
    //     throw new ApiError(500,"Avtar file is required!!")
    // }

    // // 5.upload them to cloudinary 
    // const avatar=await uploadFile(avatarLocalPath);
    // if(!avatar){
    //     throw new ApiError(400,"Avtar file required")
    // }
    if (!fs.existsSync(avatarLocalPath)) {
        throw new ApiError(500, "Avatar file does not exist!");
    }
    
    const avatar = await uploadFile(avatarLocalPath);
    const coverImage=await uploadFile(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar file to Cloudinary");
    }
    // 6.crete user object - create entry in db 
   const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        username:username.toLowerCase(),
        email:email.toLowerCase(),
        password,
    });

    // 7.remove password and refresh token field from response
    const CreatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // 8.check for user creation
    if(!CreatedUser){
        throw new ApiError(500,"Something went wrong!!")
    }

    // 9.return response
    return res.status(201).json(
        new ApiResponse(200,"User registered Successfully",CreatedUser)
    );
});

const loginUser=asyncHandler(async(req,res)=>{

    //steps to login user

    //1.get data from frontEnd
    //2.check for existence 
    //3.find user
    //4.validation
    //5.access and refresh token
    //6.send cookie
    //7.if username or password is wrong give it for change password or forgot password

    const{email , username, password}=req.body
    if(!username && !email){
        throw new ApiError(400,"Username or email required");
    }

    const existedUser=await User.findOne({
        $or:[{email}, {username}],
    });
    

    if(!existedUser){
        throw new ApiError(404,"User not exist!! Please register")
    }

    const isPasswordValide=await existedUser.isPasswordCorrect(password);

    if(!isPasswordValide){
        throw new ApiError(401,"Invalid Credentials");
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(existedUser._id);
    const loggedUser=await User.findById(existedUser._id);


    const options={
        httpOnly:true,
        secure:true,
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(
            200, 
            {
                user: loggedUser, accessToken, refreshToken

            },
            "User logged In Successfully"
        )
    )
});

const logOutUser=asyncHandler(async(req,res)=>{
    const id=req.user._id;
    await User.findByIdAndUpdate(id,{
        $unset:{refreshToken:1,}
    })
    const options={
        httpOnly:true,
        secure:true
    }

    return res.
    status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options).json(
        new ApiResponse(200,{},"User logged Out Succesfully!!")
    )
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
     const incomingRefreshToken=await req.cookies.refreshToken||req.body.refreshToken;
     if(!incomingRefreshToken){
         throw new ApiError(401,"Unauthorized request");
    }
    try {
     const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
     const user=await User.findById(decodedToken._id);
     if(!user){
         throw new ApiError(401,"Invalid refresh Token");
     }
     if(incomingRefreshToken!== user.refreshToken){
         throw new ApiError(401,"Refresh Token is expired");
     }
     const options={
         httpOnly:true,
         secure:true,
     }
    const {accessToken,newRefreshToken}= await generateAccessAndRefreshToken(user._id);
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
        new ApiResponse(200,
            {accessToken,refreshToken:newRefreshToken},
            "Access Token refreshed"
        )
        )
    }catch (error) {
        throw new ApiError(401,"Invalid Refresh Token");
   }
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user._id);
    isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Incorrect old password");
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Password changed successfully!!",{})
    );
});

const forgotPassword=asyncHandler(async(req,res)=>{
   const {email}=req.body;
   if(!email){
    throw new ApiError(401,"enter Valid Email");
   }
   const existedUser=await User.findOne({email});
   if(!existedUser){
    throw new ApiError(401,"User does not exist!!");
   }
   const resetToken=await existedUser.generateResetToken();
   existedUser.passwordResetToken=resetToken;
   await existedUser.save({validateBeforeSave:false});
    const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user:process.env.EMAIL_ID,
        pass:process.env.PASSWORD
    }
   });
   const data={
    from:process.env.EMAIL_ID,
    to:email,
    subject:"Reset Account Password Link",
    html:`
    <h2>Click on link below to reset Password</h2> 
    <a href="http://localhost:8000/api/v1/users/update-password?token=${resetToken}">Click Here<a>
    `,
   }
   console.log(data);
  try {
        transporter.sendMail(data);
          return res.status(200).json(new ApiResponse(200,{},"Email send successfuly"));
  } catch (error) {
    throw new ApiError(401,"Error while sending email")
  }

});

const updatePassword=asyncHandler(async(req,res)=>{
   try {
     const{newPassword,incomingToken}=await req.body;
     if(!incomingToken){
         throw new ApiError(401,"Unauthorized request");
    }
     const decodedToken=jwt.verify(incomingToken,process.env.RESET_TOKEN_SECRET);
     const id=decodedToken._id;
     // const id=req.user._id;
     const user=await User.findByIdAndUpdate(id,{
         $set:{resetToken:undefined,}
     });
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
     return res.status(200).json(new ApiResponse(200,{},"Password reset successfull!!"))
   } catch (error) {
    throw new ApiError(500,"Internal server error");
   }
});

const getUserDetails=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,"User details retrived successfully!",req.user));
});

const updateUserDetails=asyncHandler(async(req,res)=>{
    const {email,fullname}=req.body;
    if(!email || !fullname){
        throw new ApiError(400,"User not found!!");
    }
    const id=req.user._id;
    const existedUser=await User.findByIdAndUpdate(id,{$set:{email:email,fullname:fullname}},{new:true}).select("-password -refreshToken -passwordResetToken");
    return res.status(200).json(new ApiResponse(200,"User details updated successfully",existedUser));
});

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file missing");
    }
    const avatar=await uploadFile(avatarLocalPath);
    console.log(avatar);
    if(!avatar.url){
        throw new ApiError(400,"File not uploaded!");
    }
    const id=req.user._id;
   const existedUser=await User.findByIdAndUpdate(id,{
    $set:{
        avatar:avatar.url
    },
   },
   {new :true});
    return res.status(200).json(
        new ApiResponse(200,"Avatar updated sucessfully!",existedUser.avatar)   
    );
});

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;
    if(!username?.trim()){
        throw new ApiError(500,"User not found")
    }

   const channel= await User.aggregate([
        {
            $match:{username:username.toLowerCase()}
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                avatar:1,
                coverImage:1
            }
        }
    ]);
    if(!channel?.length){
        throw new ApiError(400,"Channel not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,"User channel fetched successfully!",channel[0])
    );
});

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[{
                                $project:{
                                    username:1,
                                    avatar:1,
                                    fullname:1
                                }
                            }]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Watch histroy fetched successfully",user[0].watchHistory)
    )
});
export {registerUser,loginUser,logOutUser,refreshAccessToken,changeCurrentPassword,forgotPassword,updatePassword,getUserDetails,updateUserDetails,updateUserAvatar,getUserChannelProfile,getWatchHistory};