import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadFile} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from 'fs';

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
        $set:{refreshToken:undefined,}
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
   try {
     const incomingRefreshToken=await req.cookies.refreshToken||req.body.refreshToken;
     if(!incomingRefreshToken){
         throw new ApiError(401,"Unauthorized request");
    }
     const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
     const user=await User.findOne(decodedToken._id);
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
   console.log(email);
   if(!email){
    throw new ApiError(401,"enter Valid Email");
   }
   const existedUser=await User.findOne({email});
   if(!existedUser){
    throw new ApiError(401,"User does not exist!!");
   }
   const resetToken=await existedUser.generateResetToken();
   console.log(resetToken)
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
   console.log(transporter);
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
//    const resetToken=req.cookies.refreshToken || req.body.refreshToken;
//    if(!resetToken){
//     throw new ApiError(401,"Token Expired");
//    };
  try {
        transporter.sendMail(data);
          return res.status(200).json(new ApiResponse(200,{},"Email send successfuly"));
  } catch (error) {
    throw new ApiError(401,"Error while sending email")
  }

});

const updatePassword=asyncHandler(async(req,res)=>{
    const{newPassword}=req.body;
    const id=req.user._id;
    await User.findByIdAndUpdate(id,{
        $set:{resetToken:undefined,}
    });
    User.password=newPassword;
    User.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{},"Password reset successfull!!"))
    
});

export {registerUser,loginUser,logOutUser,refreshAccessToken,forgotPassword,updatePassword};