import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo, updateViewCount } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import NodeCache  from "node-cache";
const videoRoutes=Router();

videoRoutes.use(verifyJWT);

videoRoutes.route('/').get(
    getAllVideos
).post(upload.fields([
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

videoRoutes.route('/:videoId').get(
    getVideoById
).patch(
    upload.single("thumbnail"),
    updateVideo
).delete(
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


// videoRoutes.route('/publish-video').post(
//     verifyJWT,
//     upload.fields([
//         {
//             name:"videoFile",
//             maxCount:1
//         },
//         {
//             name:"thumbnail",
//             maxCount:1
//         }
//     ]),
//     publishAVideo
// );

// videoRoutes.route('/get-video/:videoId').get(
//     verifyJWT,
//     getVideoById
// );

// videoRoutes.route('/update-video/:videoId').patch(
//     verifyJWT,
//     upload.single("thumbnail"),
//     updateVideo
// );

// videoRoutes.route('/delete-video/:videoId').delete(
//     verifyJWT,
//     deleteVideo
// );

// videoRoutes.route('/get-all-videos').get(
//     verifyJWT,
//     getAllVideos
// );
export {videoRoutes}