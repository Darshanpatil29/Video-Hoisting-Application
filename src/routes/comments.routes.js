import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comments.controller.js";

const commentRouter=Router()

commentRouter.use(verifyJWT);

commentRouter.route('/add-comment/:videoId').post(
    addComment
)

commentRouter.route('/get-comments/:videoId').get(
    getVideoComments
)

commentRouter.route('/update-comment/:commentId').patch(
    updateComment
)

commentRouter.route('/delete-comment/:commentId').delete(
    deleteComment
)

export {commentRouter}