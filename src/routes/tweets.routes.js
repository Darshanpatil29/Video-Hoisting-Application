import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweets.controller.js";

const tweetsRouter=Router()

tweetsRouter.use(verifyJWT)

tweetsRouter.route('/create-tweet').post(
    createTweet
)

tweetsRouter.route('/u/:userId').get(
    getUserTweets
)

tweetsRouter.route('/update-tweet/:tweetId').patch(
    updateTweet
)

tweetsRouter.route('/delete-tweet/:tweetId').delete(
    deleteTweet
)

export {tweetsRouter}