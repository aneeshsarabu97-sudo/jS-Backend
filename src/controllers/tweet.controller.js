import { asyncHandler } from "../utils/asyncHandler";
import { Tweet } from "../models/tweet.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import mongoose from "mongoose";

const createTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body

    if(!content || content.trim()===""){
        throw new ApiError(400,"Content is required to create tweet!!")
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user?._id
    })

    return res.status(200)
    .json(
        new ApiResponse(201,tweet,"Tweet created sucuessfully")
    )
})

const getUserTweets = asyncHandler(async(req,res)=>{
    const {userId} = req.params
    let {page=1,limit=10} = req.query

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400,"Unauthorized request!!")
    }

    page = parseInt(page)
    limit = parseInt(limit)

    const skip = (page - 1)*limit

    const tweets = await Tweet.find({owner:userId})
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)
    .populate("owner","fullname username avatar")

    return res.status(200)
    .json(
        new ApiResponse(201,tweets,"Tweets teched sucuesfuly!!")
    )
})

const updateTweet = asyncHandler(async(req,res)=>{
    const{tweetId} = req.params
    const{content} = req.body

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400,"Unauthorized User")
    }

    const findTweet = await Tweet.findById(tweetId)

    if (!findTweet) {
        throw new ApiError(403,"Tweet not found")
    }

    if(!content || content.trim()===""){
        throw new ApiError(400,"Content is required to create tweet!!")
    }

    if(findTweet.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403,"Only owner can update the comment")
    }

    findTweet.content=content
    await findTweet.save()

    return res.status(200)
    .json(
        new ApiResponse(200,findTweet,"Updated tweet sucuessfully")
    )
})

const deleteTweet = asyncHandler(async (req,res) =>{
    const{tweetId} = req.params
    
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Unauthorized request")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(403,"Tweet not found")
    }

    if(tweet.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403,"Only the tweet oner can delete it")
    }

    await tweet.deleteOne();
    
    return res.status(200)
    .json(
        new ApiResponse(200,{},"Tweet deleted sucuessfully")
    )
})

export{
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}