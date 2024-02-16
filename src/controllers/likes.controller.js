import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(401,"Invalid videoId");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"invalid id");
    }
    const liked=await Like.findById(videoId);
    if(!liked){
        const likedVideo=await Like.create({
            video:new mongoose.Types.ObjectId(videoId),
            likedBy:new mongoose.Types.ObjectId(req.user._id)
        }
        )
        if(!likedVideo){
            throw new ApiError(401,"something went wrong while liking the video");
        }
        return res.status(200)
        .json(
            new ApiResponse(200,"successfuly liked video",likedVideo)
        )
    }
    else{
        const likeDelete=await Like.findByIdAndDelete(liked._id);
        if(!likeDelete){
            throw new ApiError(401,"something went wrong while deleting like on video");
        }
        return res.status(200)
        .json(
            new ApiResponse(200,"like deleted successfully from video",likeDelete)
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(401,"Invalid commentId");
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(401,"invalid id");
    }
    const liked=await Like.findById(commentId);
    if(!liked){
        const likedComment=await Like.create({
            comment:new mongoose.Types.ObjectId(commentId),
            likedBy:new mongoose.Types.ObjectId(req.user._id)
        }
        )
        if(!likedComment){
            throw new ApiError(401,"something went wrong while liking the comment");
        }
        return res.status(200)
        .json(
            new ApiResponse(200,"successfuly liked comment",likedComment)
        )
    }
    else{
        const likeDelete=await Like.findByIdAndDelete(liked._id);
        if(!likeDelete){
            throw new ApiError(401,"something went wrong while deleting like on comment");
        }
        return res.status(200)
        .json(
            new ApiResponse(200,"like deleted successfully from comment",likeDelete)
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(401,"Invalid tweetId");
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(401,"invalid id");
    }
    const liked=await Like.findById({tweetId});
    if(!liked){
        const likeTweet=await Like.create({
            tweet:new mongoose.Types.ObjectId(tweetId),
            likedBy:new mongoose.Types.ObjectId(req.user._id)
        }
        )
        if(!likeTweet){
            throw new ApiError(401,"something went wrong while liking the tweet");
        }
        return res.status(200)
        .json(
            new ApiResponse(200,"successfuly liked video",likeTweet)
        )
    }
    else{
        const likeDelete=await Like.findByIdAndDelete(liked._id);
        if(!likeDelete){
            throw new ApiError(401,"something went wrong while deleting like on tweet");
        }
        return res.status(200)
        .json(
            new ApiResponse(200,"like deleted successfully from tweet",likeDelete)
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}