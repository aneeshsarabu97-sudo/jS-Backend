import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {Video} from "../models/video.model"
import {Comment} from "../models/comment.model"
import { ApiResponse } from "../utils/ApiResponse";


// 1. Get comments for a video (with pagination)

const getVideoComments = asyncHandler(async(req , res)=>{
    const {videoId} = req.params
    let {page=1,limit=10}=req.query

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video ID Formant")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"No video exists with the given videoId.")
    }

    page = parseInt(page)
    limit = parseInt(limit)

    const skip = (page- 1 )*limit

    const comments = await Comment.find({video : videoId})
    .sort({createdAt : -1})
    .skip(skip)
    .limit(limit)
    .populate("owner","fullname username avatar")

    return res.status(200)
    .json(
        new ApiResponse(200,comments,"Comments fetched sucuessfully...")
    )
})

// 2. Add a comment

const addComment = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const {content} = req.body

    if (!content || content.trim()==="") {
        throw new ApiError(400,"Comment content is required")
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,"Invalid VideoId")
    }

    const video = Video.findById(videoId)
    if (!video) {
        throw new ApiError(400,"No video is present with the provided videoid")
    }

    const comment = Comment.create({
        content,
        video:videoId,
        owner:req.user?._id
    })

    return res.status(200)
    .json(
        new ApiResponse(201,comment,"Added comment sucuessfully")
    )
})

// 3. Update a comment

const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const {content} = req.body
    
    if (!content || content.trim()==="") {
        throw new ApiError(400,"Comment content is required to update the comment")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400,"Comment not found to update it!")
    }

    //OwnerShip Checking
    if (comment.owner?.toString() !== req.user._id.toString()) {
        throw new ApiError(403,"Unauthorized to update this comment");
    }
    comment.content=content;
    await comment.save();

    return res.status(200)
    .json(
        new ApiResponse(200,comment,"Comment updated successfully")
    )
})

// 4. Delete a comment


const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    
    const comment = Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404,"Comment not found")
    }

    //OwnerShip Checking
    if (comment.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(403,"Unauthorized to delete this comment");
    }

    await comment.deleteOne();

    return res.status(200)
    .json(
        new ApiResponse(200,{},"Comment deleted sucuessfully")
    )

})

export{
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}