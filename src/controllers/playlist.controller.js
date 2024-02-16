import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!name){
        throw new ApiError(400,"Name is required for playlist")
    }

    const existedPlaylist=await Playlist.findOne({name})
    if(existedPlaylist){
        throw new ApiError(400,"playlist with given name already exists");
    }

   const playlist=await Playlist.create(
        {
            name:name,
            description:description,
            owner: req.user._id
        }
    )

    const createdPlaylist=await Playlist.findById(playlist._id);
    if(!createdPlaylist){
        throw new ApiError(400,"something went wrong while creating playlist");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,"Playlist created successfully",createdPlaylist)
    );
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const id=userId.trim();
    if(!isValidObjectId(id)){
        throw new ApiError(400,"User Id is not valid")
    }
    const userPlaylist=await Playlist.aggregate([
        {
          $match: {
            owner:new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
              },
          },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        {
          $addFields: {
            playlist: {
              $first: "$videos",
            },
          },
        },
        {
          $project: {
            name:1,
            description:1,
            videos:1,
            owner:{
              username:1,
              fullname:1,
              avatar:1,
            }
          },
        },
      ])
    if(!userPlaylist){
        throw new ApiError(400,"Unable to fetch user playlists")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,"Successfully fetched users all playlists",userPlaylist)
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const pid=playlistId.trim();
    if(!isValidObjectId(pid)){
        throw new ApiError(400,"Invalid playlist id");
    }
    const playlist=await findById(pid)
    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    if(!playlist){
        throw new ApiError(500, "something went wrong while fetching playlist")
    }

     // return responce
     return res.status(201).json(
        new ApiResponse(200, "playlist fetched  successfully!!",playlist))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId) {
        throw new ApiError(401, "Both playlistId and videoId are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(401, "Video is already added to playlist");
    }

    const videoToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        }
    );

    if (!videoToPlaylist) {
        throw new ApiError(401, "Something went wrong while adding video to playlist");
    }

    return res.status(200).json(
        new ApiResponse(200, "Video added successfully to playlist", videoToPlaylist)
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!playlistId || !videoId) {
        throw new ApiError(400,"playlistId and videoId both are required");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$pull:{videos:new mongoose.Types.ObjectId(videoId)}},
        {new:true}
    )

    if (!playlist) {
        throw new ApiError(500, `something went wrong while removing video from playlist`);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"playlist updated successfully",playlist)
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(400,"PlaylistId required");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        throw new ApiError(500, `something went wrong while deleting the playlist`);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!name || !description) {
        throw new ApiError(400,"Playlist name and description are required");
    }

    if (!playlistId) {
        throw new ApiError(400,"PlaylistId is required");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
        $set:
        {name:name,
        description:description
    }
},{new:true}
    )

    if (!playlist) {
        throw new ApiError(400,"playlist not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"playlist created successfully",playlist)
    )
})
export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}