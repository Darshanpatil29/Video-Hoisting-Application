import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedComments, getLikedTweets, getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/likes.controller.js";

const likesRouter=Router()

likesRouter.use(verifyJWT)
likesRouter.route('/toggle/v/:videoId').post(
    toggleVideoLike
)
likesRouter.route('/toggle/c/:commentId').post(
    toggleCommentLike
)
likesRouter.route('/toggle/t/:tweetId').post(
    toggleTweetLike
)

likesRouter.route('/liked-videos').get(
    getLikedVideos
)
likesRouter.route('/liked-comments').get(
    getLikedComments
)
likesRouter.route('/liked-Tweets').get(
    getLikedTweets
)
export {likesRouter}