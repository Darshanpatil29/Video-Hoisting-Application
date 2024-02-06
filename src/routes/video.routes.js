import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo, updateViewCount } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const videoRoutes=Router();

videoRoutes.route('/publish-video').post(
    verifyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishAVideo
);

videoRoutes.route('/get-video/:videoId').get(
    verifyJWT,
    getVideoById
);

videoRoutes.route('/update-video/:videoId').patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
);

videoRoutes.route('/delete-video/:videoId').delete(
    verifyJWT,
    deleteVideo
);

videoRoutes.route('/view/:videoId').patch(
    verifyJWT,
    updateViewCount
)

videoRoutes.route('/unpublish-video/:videoId').patch(
    verifyJWT,
    togglePublishStatus
)
export {videoRoutes}