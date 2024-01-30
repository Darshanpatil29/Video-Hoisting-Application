import { Router } from "express";
import { forgotPassword, logOutUser, loginUser, registerUser, updatePassword } from "../controllers/user.controller.js";
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
    verifyJWT,
    updatePassword
)
export {userRoutes};