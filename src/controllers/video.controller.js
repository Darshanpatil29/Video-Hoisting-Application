import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/videos.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFile, uploadFile} from "../utils/cloudinary.js"
import { response } from "express"

    const getAllVideos = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, query = " ", sortBy, sortType, userId } = req.query
        //TODO: get all videos based on query, sort, pagination
    
    
        const options ={
            page,
            limit
        }
    
        const videosAggregate = [
            {
                $match:{
                    $and:[
                        {
                            isPublished:true
                        },
                        {
                            $text:{
                                $search:query
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    score:{
                        $meta:"textScore"
                    }
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner",
                    pipeline:[
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
                                subscriberCount:{
                                    $size:"$subscribers"
                                },
                                isSubscribed:{
                                    $cond:{
                                    if:{$in:[req.user._id,"$subscribers.subscriber"]},
                                    then:true,
                                    else:false
                                }
                            }
                            }
                        },
                        {
                            $project:{
                                username:1,
                                fullname:1,
                                avatar:1,
                                subscriberCount:1,
                                isSubscribed:1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    owner:{
                        $first:"$owner"
                    }
                }
            },
            {
                $sort:{
                    score:-1,
                    views:-1
                }
            }
        ];
        console.log("Before aggregation:", videosAggregate);
        const videos = await Video.aggregatePaginate(videosAggregate,options);
        console.log("after aggregation:", videos);
        if (!videos) {
            throw new ApiError(500,"something want wrong while get all videos");
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200,"get all videos successfully",videos)
        )
    })

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    console.log(title);
    if([title,description].some((field)=>{
        if(field.trim()==="")
        return true;
    }))
    {
        throw new ApiError(400,"Title or Description is required for video")
    }
    const videoFileLocalPath=req.files?.videoFile[0].path;
    const thumbnailLocalPath=req.files?.thumbnail[0].path;
    if(!videoFileLocalPath){
        throw new ApiError(400,"Video file is required");
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail file is required");
    }
   const videoFile=await uploadFile(videoFileLocalPath)
   const thumbnailFile=await uploadFile(thumbnailLocalPath)
    if(!videoFile){
        throw new ApiError(400,"Problem while uploading video")
    }
    if(!thumbnailFile){
        throw new ApiError(400,"Problem while uploading thumbnail")
    }
    const uploadVideo=await Video.create(
        {
            title:title,
            description:description,
            duration:videoFile.duration,
            isPublished:true,
            videoFile:videoFile.url,
            thumbnail:thumbnailFile.url,
            owner:new mongoose.Types.ObjectId(req.user._id),
        }
    );
    if(!uploadVideo){
        throw new ApiError(400,"Video is not uploaded in db");
    }
    const createdVideo=await Video.findById(uploadVideo._id);
    if(!createdVideo){
        throw new ApiError(401,"Video is not uploaded in db");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video Uploade successfully",createdVideo)
    );
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!(await Video.findById(videoId))){
        throw new ApiError(400,"Video not found!!")
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(401,"Video not found!!")
    }
    const video=await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"totalLikes",
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
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
                            subscriberCount:{
                                $size:"$subscribers"
                            },
                            isSubscribed:{
                                $cond:{
                                if:{$in:[req.user._id,"$subscribers.subscriber"]},
                                then:true,
                                else:false
                            }
                        }
                        }
                    },
                    {
                        $project:{
                            username:1,
                            fullname:1,
                            avatar:1,
                            subscriberCount:1,
                            isSubscribed:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                },
                likesCount:{
                    $size:"$totalLikes"
                },
                isLiked:{
                    $cond:{
                        if:{$in:[req.user._id,"$totalLikes.likedBy"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
               isPublished:0,
               updatedAt:0
            }
        }
    ])
    console.log(video[0]);
return res
.status(200)
.json(
    new ApiResponse(
        200,
        "Video get successfully",
        video[0]
    )
)
});


const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    if(!(await Video.findById(videoId))){
        throw new ApiError(400,"Video not found!!")
    }
    const {title, description } = req.body;
    const thumbnailLocalPath=req.file?.path;

    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "at list one field is required to update video");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id");
    }

   const thumbnail=await uploadFile(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(400,"Problem while updating thumbnail")
    }

    const createdVideo=await Video.findById(videoId);

    createdVideo.title=title;
    createdVideo.description=description;
    createdVideo.thumbnail=thumbnail.url;

    await createdVideo.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,"video updated successfully",createdVideo)
    )

});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiError(400,"Invalid video id");
    }
    const createdVideo=await Video.findById(videoId);
    const videoDelete=await deleteFile(createdVideo.videoFile.url);
    const thumbnailDelete=await deleteFile(createdVideo.thumbnail.url);
    if(videoDelete){
        throw new ApiError(400,"error while deleting video file");
    }
    if(thumbnailDelete){
        throw new ApiError(400,"error while deleting thumbnail file")
    }
    const deletedvideo=await Video.findByIdAndDelete(videoId);
    if(!deletedvideo){
        throw new ApiError(400,"error while deleting video")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,"Video deleted successfully",{})
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const createdVideo = await Video.findById(videoId);

    if (!createdVideo) {
        throw new ApiError(400, `video with the id ${videoId} dose not exist`);
    }

    createdVideo.isPublished = !createdVideo.isPublished;
    await createdVideo.save({ validateBeforeSave: false });

    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            createdVideo,
            "Published Status chanced successfully"
        )
    )
})


const updateViewCount=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(401,"Invalid video Id")
    }
    const createdVideo=await Video.findByIdAndUpdate(videoId,{
       $inc:{views:1}
       
    },{new:true})
    if(!createdVideo){
        throw new ApiError(400,"Unable to increase views count");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Views incremented successfully",createdVideo)
    )
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateViewCount
}
