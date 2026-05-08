import { Router } from "express";
import { 
    loginUser,
    logoutuser, 
    refreshAccessToken,
    registerUser,
    changecurrentpassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverimage,
    getuserchannelprofile,
    watchhistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()


router.route("/register").post(
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

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT , logoutuser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changecurrentpassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-details").patch(verifyJWT,updateAccountDetails)
router.route("/change-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/change-coverimage").patch(verifyJWT,upload.single("coverImage"),updateUsercoverimage)
router.route("/c/:getchannel").get(verifyJWT,getuserchannelprofile)
router.route("/videohistory").get(verifyJWT,watchhistory)


export default router;