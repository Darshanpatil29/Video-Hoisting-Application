import mongoose from "mongoose";
import jwt from "jsonwebtoken";  
import bcrypt from "bcrypt";


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,//cloudinary service
        required:true
    },
    coverImage:{
        type:String,//cloudinary service
    },
    password:{
        type:String,
        required:[true,"Password is required!!"],
    },
    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    refreshToken:{
        type:String
    },
    passwordResetToken:{
        type:String
    }
},{timestamps:true});

// password encryption
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
       this.password=await bcrypt.hash(this.password,10);
        next();
    }
    return next();
});

// password validation
userSchema.methods.isPasswordCorrect=async function(password){
   const result= await bcrypt.compare(password,this.password);
   return result;
}

userSchema.methods.generateAccessToken=async function(){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        fullname:this.fullname,
        username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken=async function(){
   return jwt.sign({
        _id:this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
   
}
userSchema.methods.generateResetToken=async function(){
    return jwt.sign({
         _id:this._id,
         email:this.email,
         fullname:this.fullname,
         username:this.username
     },
     process.env.RESET_TOKEN_SECRET,{
         expiresIn:process.env.RESET_TOKEN_EXPIRY
     })
 }

export const User=mongoose.model("User",userSchema);