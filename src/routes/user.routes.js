import { Router } from "express";
import { addVideoToWatchHistory, changeCurrentPassword, forgotPassword, getUserChannelProfile, getUserDetails, getWatchHistory, logOutUser, loginUser, registerUser, updatePassword, updateUserAvatar, updateUserDetails } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
const userRoutes=Router();

userRoutes.route('/register').post(
    upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),
    registerUser
)

userRoutes.route('/login').post(
    loginUser
)

userRoutes.route('/user-details').get(
    verifyJWT,
    getUserDetails
)

userRoutes.route('/update-user-details').patch( // patch used because it modifies only that part of resource instead of whole document
    verifyJWT,
    updateUserDetails
)
userRoutes.route('/update-avatar').patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)

userRoutes.route('/add-to-Watch-History/:videoId').patch(
    verifyJWT,
    addVideoToWatchHistory
)
// secured routes
userRoutes.route('/logOut').post(
    verifyJWT,
    logOutUser
)

userRoutes.route('/refresh-token').post(
    refreshAccessToken
)

userRoutes.route('/forgot-password').post(
    forgotPassword
)

userRoutes.route('/update-password').patch(
    updatePassword
)

userRoutes.route('/change-password').post(
    verifyJWT,
    changeCurrentPassword
)

userRoutes.route('/channel/:username').get(
    verifyJWT,
    getUserChannelProfile
)

userRoutes.route('/watch-history').get(
    verifyJWT,
    getWatchHistory
)

export {userRoutes};