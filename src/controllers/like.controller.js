import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Like } from "../models/like.model";
import { ApiResponse } from "../utils/ApiResponse";
import { Video } from "../models/video.model";

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const{videoId} = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,"Invalid video id")
    }

    const existinglike = await Like.findOne({
        video:videoId,
        likedby:req.user?._id
    })

    if(existinglike){
        await existinglike.deleteOne();

        return res.status(200)
        .json(
            new ApiResponse(200,{},"Video unliked sucuessfully")
        )
    }

    const like = await Like.create({
        video:videoId,
        likedby:req.user?._id

    })

    return res.status(200)
        .json(
            new ApiResponse(200,like,"Video liked sucuessfully")
        )  
})

const toggleCommentLike = asyncHandler(async (req, res) => {

    const { commentId } = req.params

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    // Check if already liked
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    // If already liked -> unlike
    if (existingLike) {

        await existingLike.deleteOne()

        return res.status(200).json(
            new ApiResponse(200,{},"Comment unliked successfully")
        )
    }

    // Else create like
    const like = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res.status(200).json(
        new ApiResponse(
200,like,"Comment liked successfully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {

    const { tweetId } = req.params

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    // Check if tweet already liked
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    // If already liked -> unlike
    if (existingLike) {

        await existingLike.deleteOne()

        return res.status(200).json(
            new ApiResponse(
                200,{}, "Tweet unliked successfully"))
    }

    // Else create like
    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    return res.status(200).json(
        new ApiResponse(200,like,"Tweet liked successfully")
    )

})

const getLikedVideos = asyncHandler(async (req, res) => {
    let {page=1,limit=15} = req.query

    page = parseInt(page)
    limit = parseInt(limit)

    if (page<1 || limit<1) {
        throw new ApiError(400,"Invalid Pagination values")
    }

    const skip = (page - 1) * limit

    const likedvideos = await Like.find({
        likedBy:req.user?._id,
        video:{$exists : true}
    })
    .populate("video","title thumbnail owner views createdAt")
    .sort({createdAt:-1})
    .skip(skip).limit(limit)    

    return res.status(200)
    .json(
        new ApiResponse(200,likedvideos,"Liked video fetched sucuessfully")
    )
})

export{
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}