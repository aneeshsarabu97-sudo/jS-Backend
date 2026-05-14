import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Playlist } from "../models/playlist.model";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose, { mongo } from "mongoose";

const createPlaylist = asyncHandler(async(req , res)=>{
    const {name,description} = req.body

    if (!name || name.trim()==="") {
        throw new ApiError(400,"Name required to create the playlist")
    }

    const playlist = Playlist.create({
        name,
        description,
        owner:req.user?._id

    })

    return res.status(200)
    .json(
        new ApiResponse(201,playlist,"Playlist created sucuessfully...")
    )
})

const getUserPlaylist = asyncHandler(async(req,res)=>{
    const {userId}=req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400,"Invalid user id")
    }

    const playlist = await Playlist.find({
        owner:userId
    })

    if (playlist.length===0) {
        throw new ApiError(404,"Playlist not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist fetched sucuesfully")
    )
})

const getPlaylistById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400,"Invalid playlist Id")
    }

    const playlist = await Playlist.findOne({
        _id:playlistId
    })

    return res.status(200)
    .json(
        new ApiResponse(201,"Playlist fetched scuessfullyy")
    )
})

const addVideosToPlaylist = asyncHandler(async(req,res)=>{
    const{playlistId,videoId} = req.params

    if (
        !mongoose.Types.ObjectId.isValid(playlistId) ||
        !mongoose.Types.ObjectId.isValid(videoId)
    ) 
    {
        throw new ApiError(400,"Invalid ID's")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"Unauthorized request")
    }

    const alreadyExists = await playlist.videos.includes(videoId)

    if (alreadyExists) {
        throw new ApiError(404,"Video already exists in playlist")
    }
    playlist.videos.push(videoId)

    await playlist.save()

    return res.status(200)
    .json(
        new ApiResponse(200,playlist,"Video added sucuesfully to playlist")
    )
})