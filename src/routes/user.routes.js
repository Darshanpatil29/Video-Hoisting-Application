import { Router } from "express";
import { changeCurrentPassword, forgotPassword, getUserDetails, logOutUser, loginUser, registerUser, updatePassword, updateUserAvatar, updateUserDetails } from "../controllers/user.controller.js";
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

userRoutes.route('/user-details').post(
    verifyJWT,
    getUserDetails
)

userRoutes.route('/update-user-details').post(
    verifyJWT,
    updateUserDetails
)
userRoutes.route('/update-avatar').post(
    upload.single("avatar"),
    verifyJWT,
    updateUserAvatar
)

// secured routes
userRoutes.route('/logOut').post(
    verifyJWT,
    logOutUser
)

userRoutes.route('/refreshToken').post(
    refreshAccessToken
)

userRoutes.route('/forgot-password').post(
    forgotPassword
)

userRoutes.route('/update-password').post(
    updatePassword
)

userRoutes.route('/change-password').post(
    changeCurrentPassword
)
export {userRoutes};