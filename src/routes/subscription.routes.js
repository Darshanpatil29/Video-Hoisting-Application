import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const subscribeRoutes=Router()

subscribeRoutes.use(verifyJWT)

subscribeRoutes
.route('/c/:channelId')
.post( toggleSubscription )
.get(getUserChannelSubscribers)

subscribeRoutes.route('/u/:subscriberId')
.get(getSubscribedChannels)

export {subscribeRoutes}