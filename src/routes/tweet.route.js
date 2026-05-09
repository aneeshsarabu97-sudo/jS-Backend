import {Router} from "express";
import { createTweet,getUserTweets,updateTweet,deleteTweet } from "../controllers/tweet.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.route("/").post(verifyJWT,createTweet)
router.route("/tweets").get(verifyJWT,getUserTweets)
router.route("/:tweetId").patch(verifyJWT,updateTweet).delete(verifyJWT,deleteTweet)

export default router;