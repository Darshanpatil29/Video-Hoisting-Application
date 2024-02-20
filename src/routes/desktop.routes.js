import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/desktop.controller.js";

const desktopRoutes=Router();

desktopRoutes.use(verifyJWT);

desktopRoutes.route('/get-stats').get(
    getChannelStats
)

desktopRoutes.route('/get-channel-videos').get(
    getChannelVideos
)

export {desktopRoutes}
