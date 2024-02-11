import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const playlistRoutes=Router()

playlistRoutes.use(verifyJWT)

playlistRoutes.route('/').post(
    createPlaylist
)

playlistRoutes.route('/p/:playlistId').get(
    getPlaylistById
).patch(
    updatePlaylist
).delete(
    deletePlaylist
)

playlistRoutes.route('/user/:userId').get(
    getUserPlaylists
)

playlistRoutes.route('/add/:playlistId/:videoId').patch(
    addVideoToPlaylist
)

playlistRoutes.route('/remove/:playlistId/:videoId').patch(
    removeVideoFromPlaylist
)

export {playlistRoutes}