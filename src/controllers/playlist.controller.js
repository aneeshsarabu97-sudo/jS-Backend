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

    const alreadyExists = await Playlist.findOne({
        _id: playlistId,
        videos: videoId
    })

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

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if (
        !mongoose.Types.ObjectId.isValid(playlistId) ||
        !mongoose.Types.ObjectId.isValid(videoId)
    ) 
    {
        throw new ApiError(400,"Invalid ID's")
    }

    const playlist = await Playlist.findById(playlistId)
    const video = await Playlist.findOne({
        _id:playlistId,
        videos:videoId
    })

    if (!playlist || !video) {
        throw new ApiError(404,"No playlist or video in the playlist exists")
    }

    if (playlist.owner.toString()!==req.user?._id.toString()) {
        throw new ApiError(404,"Only owner of the playlist can delete the video")
    }

    playlist.videos.pull(videoId)

    await playlist.save()

    return res.status(200)
    .json(
        new ApiResponse(200,playlist,"Deleted video from playlist sucuessfullyy")
    )
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400,"Inavlid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist is not available")
    }

    if (playlist.owner.toString()!==req.user?._id.toString()) {
        throw new ApiError(403,"Only owner can delete the playlist")
    }

    await playlist.deleteOne();
   
    return res.status(200)
    .json(
        new ApiResponse(200,{},"Playlist deleted sucuessfully!!")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400,"Invalid playlist ID")
    }

    if (!name || name.trim()==="" || !description || description.trim()==="") {
        throw new ApiError(400,"Name and description required to update the playlist")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404,"Playlist not found")
    }

    if (playlist.owner.toString()!==req.user?._id.toString()) {
        throw new ApiError(403,"Only owners can update the playlist")
    }

    playlist.name=name
    playlist.description=description

    await playlist.save()

    return res.status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist updated sucuessfully")
    )
})

export{
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideosToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}


