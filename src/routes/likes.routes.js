import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/likes.controller.js";

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
export {likesRouter}