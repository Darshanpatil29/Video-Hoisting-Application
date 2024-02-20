import mongoose from "mongoose"
import {Video} from "../models/videos.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/likes.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const stats=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"owner",
                as:"allVideos",
                pipeline:[
                    {
                        $lookup:{
                            from:"likes",
                            localField:"_id",
                            foreignField:"video",
                            as:"likes"
                        }
                    },
                    {
                        $addFields:{
                            likesCount:{$size:"$likes"}
                        }
                    },
                    {
                        $project:{
                            likes:0
                        }
                    }
                ]
            }
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
            $addFields:{
                totalSubscribers:{$size:"$subscribers"},
                totalVideos:{$size:"$allVideos"},
                totalViews:{$sum:"$allVideos.views"},
                totalLikes:{$sum:"$allVideos.likesCount"}
            }
        },
        {
            $project:{
                totalVideos:1,
                totalViews:1,
                totalLikes:1,
                totalSubscribers:1,
                username:1,
                fullName:1,
                avatar:1,
                coverImage:1,

            }
        }
    ])
    if(!stats){
        throw new ApiError(401,"Channel not found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,stats[0],"get channel stats successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ]);
    if(!videos){
        throw new ApiError(401,"Something went wrong while fetching all videos");
    }
    return res.status(200)
    .json(
        new ApiResponse(200,"All videos successfully",videos)
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }