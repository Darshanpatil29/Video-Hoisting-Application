import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    if(!content){
        throw new ApiError(400,"Content required for tweets")
    }
    const tweet=await Tweet.create({
        owner:new mongoose.Types.ObjectId(req.user._id),
        content:content.trim()
    })
    if(!tweet){
        throw new ApiError(400,"Something went wrong while creating tweet")
    }
    const createdTweet=await Tweet.findById(tweet._id)
    if(!createdTweet){
        throw new ApiError(400,"Something went wrong while fetching tweet")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,"Tweet created successfully",createdTweet)
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {owner}=req.params

    if(!owner || !isValidObjectId(owner)){
        throw new ApiError(401,"Invalid user Id")
    }

    const userTweets=await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(owner)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $addFields:{
                owner:{$first:"$owner"}
            }
        },{
            $project:{
                content:1,
                owner:{
                    username:1,
                    fullname:1,
                    avatar:1
                }
            }
        }
    ])
    if(!userTweets){
        throw new ApiError(401,"something went wrong while fetching tweets")
    }
    return res.status(200)
    .json(new ApiResponse(200,"User tweets fetched successfully",userTweets))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params;
    const {content}=req.body;

    if(!tweetId){
        throw new ApiError(401,"Invalid tweetId")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(401,"Invalid tweetId");
    }
    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content:content.trim()
            }
        },{
            new:true
        }
    )
    if(!updatedTweet){
        throw new ApiError(401,"Something went wrong while updating tweet");
    }
    return res.status(200)
    .json(
        new ApiResponse(200,"tweet updated successfully",updatedTweet)
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400,"tweetId is invalid");
    }

    const deletedTweet= await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(500, `something went wrong while deleting the tweet`);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}