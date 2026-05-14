import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Subscription } from "../models/subscription.model";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channrlId} = req.params

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400,"Invalid channel id")
    }

    const channel = await User.findById(channrlId)

    if(!channel){
        throw new ApiError(400,"Channel does not exist")
    }


    if (req.user?._id.toString() === channelId) {
        throw new ApiError(400,"You cannot subscribe to yourself")
    }
    const existingSubscription = await Subscription.findOne({
        subscriber:req.user?._id,
        channel:channelId
    })

    if(existingSubscription){
        await existingSubscription.deleteOne();

        return res.status(200)
        .json(
            new ApiResponse(200,existingSubscription,"Channel unsubscribed sucuessfully")
        )
    }

    const subscribe = await Subscription.create({
        subscriber:req.user?._id,
        channel:channelId
    })

    return res.status(200)
    .json(
        new ApiResponse(201,subscribe,"Channel subscribed sucuessfully")
    )
})

const getChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400,"Invalid channel id")
    }

    const channel = await User.findById(channelId)

    if(!channel){
        throw new ApiError(400,"Channel does not exists")
    }

    const subscribers = await Subscription.find({
        channel:channelId
    })
    .populate("subscriber","fullname username avatar coverImage")

    return res.status(200)
    .json(
        new ApiResponse(200,subscribers,"Fetched channel subscribers sucuessfully!!")
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400,"Invalid channel id")
    }

    const user = await User.findById(subscriberId)

    if (!user) {
        throw new ApiError(400,"User not existing")
    }

    const subscribers = await Subscription.find({
        subscriber:subscriberId
    })
    .populate("channel","fullname username avatar coverImage")

    return res.status(200)
    .json(
        new ApiResponse(200,subscribers,"Fetched subscribedChannels sucuessfully!!")
    )

})

export{
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels
}