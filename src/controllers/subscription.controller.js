import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId.trim())){
       throw new ApiError(400,"invalid channel ID") 
    }
   const existeduser=await Subscription.findOne(
        {
            $and:[
                {
                    subscriber:new mongoose.Types.ObjectId(req.user._id)
                },
                {
                    channel:new mongoose.Types.ObjectId(channelId)
                }
            ]
        }
    )
    if(existeduser){
        const unsubscribe=await Subscription.findOneAndDelete(
            {
                subscriber:new mongoose.Types.ObjectId(req.user._id),
                channel:new mongoose.Types.ObjectId(channelId)
            }
        )

        if(!unsubscribe){
            throw new ApiError(400,"Something went wrong while unsubscribing")
        }
        else{
            return res.status(200)
            .json(
                new ApiResponse(200,"toggled to unsubscribe",unsubscribe)
            )
        }
    }
    else{
        const subscribe=await Subscription.create(
            {
                subscriber:new mongoose.Types.ObjectId(req.user._id),
                channel:new mongoose.Types.ObjectId(channelId)
            }
        )
        if(!subscribe){
            throw new ApiError(400,"Something went wrong while subscribing")
        }
        else{
            return res.status(200)
            .json(new ApiResponse(200,"Subscribed Successfully",subscribe)) 
        }
    }    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId.trim())){
        throw new ApiError(400,"invalid channel ID") 
    }
    const subscriber=await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId.trim())
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber",
            }
        },{
            $addFields:{
                subscriberCount:{
                    $size:"$subscriber"
                }
            }
        },
        {
            $project:{
                subscriber:{
                fullname:1,
                username:1,
                avatar:1,
                subscriberCount:1,
                },
                subscriberCount:1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,"fetched Subscriber list successfully",subscriber));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"invalid subscriber ID") 
    }
   const channelSubscribed=await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribedToCount:{
                    $size:"$subscribedTo"
                }
            }
        },
        {
            $project:{
                subscribedToCount:1,
            subscribedTo:                  {
                username:1,
                fullname:1,
                avatar:1,
                coverImage:1
            }
            }
        }        
    ])
    return res.status(200)
    .json(new ApiResponse(200,"fetched Subscriber list successfully",channelSubscribed))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}