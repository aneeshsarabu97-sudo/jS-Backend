import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { toggleSubscription , getChannelSubscribers, getSubscribedChannels} from "../controllers/subscription.controller";
const router = Router()

router.route("/c/:channelId").post(verifyJWT,toggleSubscription)
router.route("/c/:channelId/subscribers").get(verifyJWT,getChannelSubscribers)
router.route("/u/:subscriberId/subscribed").get(verifyJWT,getSubscribedChannels)

export default router;
