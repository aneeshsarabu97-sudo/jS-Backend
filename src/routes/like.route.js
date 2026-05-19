import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVIdeoLike } from "../controllers/like.controller";

const router = Router()

router.route("/comment-like").post(verifyJWT,toggleCommentLike)
router.route("/tweet-like").post(verifyJWT,toggleTweetLike)
router.route("/video-like").post(verifyJWT,toggleVideoLike)
router.route("/getlikedvideos").get(verifyJWT,getLikedVideos)

export default router;