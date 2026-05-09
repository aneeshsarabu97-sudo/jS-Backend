import {Router} from "express";
import { getVideoComments,addComment,updateComment,deleteComment } from "../controllers/comment.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.route("/:videoId").get(verifyJWT,getVideoComments)
router.route("/").post(verifyJWT,addComment)
router.route("/:commentId").patch(verifyJWT,updateComment).delete(verifyJWT,deleteComment)


export default router;