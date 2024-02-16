import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comments.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(401, "Video is required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid Video Id");
    }

    const aggregateComments = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $addFields: {
                owner: {
                    avatar: "$user.avatar",
                    username: "$user.username",
                    fullname: "$user.fullname"
                }
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
                __v: 1
            }
        }
    ];

    const comments = await Comment.aggregate(aggregateComments);

    const totalDocs = comments.length;
    const totalPages = Math.ceil(totalDocs / limit);
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedComments = comments.slice(startIdx, endIdx);

    return res.status(200).json(
        new ApiResponse(200, "Comments fetched successfully", {
            docs: paginatedComments,
            totalDocs,
            limit,
            page: parseInt(page),
            totalPages,
            pagingCounter: 1,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null
        })
    );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params;
    const {content}=req.body;
    if(!videoId || !content){
        throw new ApiError(400,"Inavlid videoId or comment content");
    }
    const comment=await Comment.create({
        content:content,
        video:new mongoose.Types.ObjectId(videoId),
        owner:new mongoose.Types.ObjectId(req.user._id),
    });
    const addedComment=await Comment.findById(comment._id);
    console.log(addedComment);
    if(!addedComment){
        throw new ApiError(401,"something went wrong while adding comment to video");
    }
    return res.status(200)
    .json(
        new ApiResponse(200,"comment added successfully to video",addedComment)
    );
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params;
    const {content}=req.body;
    if(!commentId){
        throw new ApiError(401,"Invalid commentId")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(401,"Invalid commentId");
    }
    const updatedComment=await Comment.findByIdAndUpdate(commentId,
        {
            $set:{
                content:content.trim()
            }
        },{
            new:true
        }
    )
    if(!updatedComment){
        throw new ApiError(401,"Something went wrong while updating comment");
    }
    return res.status(200)
    .json(
        new ApiResponse(200,"Comment updated successfully",updatedComment)
    )
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    // TODO: delete playlist
    if (!commentId) {
        throw new ApiError(400,"commentId required");
    }

    const deletedcomment= await Comment.findByIdAndDelete(commentId);

    if (!deletedcomment) {
        throw new ApiError(500, `something went wrong while deleting the comment`);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}