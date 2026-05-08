import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const generateAcessandRefreshTokens = async(user_id)=>{
    try {
        const user = await User.findById(user_id)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()
        
        
        user.refreshtoken= refreshtoken
        await user.save({ validateBeforeSave:false })
        return {accesstoken,refreshtoken}
    } catch (error) {
        console.log(error)
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
    }
}


const registerUser=asyncHandler(async (req,res)=>{
        //get user details from frontend
        //validation-not empty
        //check if a user already exists with help of email and username
        //check for coverimage and avatar
        //upload them on cloudinary
        //create user object-create enrty in DB
        //remove password and refresh token field from response
        //check for user creation
        //return response

        //1.
        const {fullname,email,username,password}=req.body
        

        //2.
        if (
            [fullname,email,username,password].some(
                (field)=>
                    typeof field!=="string" || field?.trim()==="")
        ) {
            throw new ApiError(400,"All Fields are required");
        }

        //3.
        const existedUser=await User.findOne({
            $or:[{ username },{ email }]
        })
        if(existedUser){
            throw new ApiError(409,"User already exists with the same username and email");
        }    

        //4.
        const avatars = req.files?.avatar?.[0]?.path
        const coverimages= req.files?.coverImage?.[0]?.path

        if (!avatars || !coverimages) {
            throw new ApiError(400,"Both avatar and coverImage are required");
        }

        //5.
        const avataruploaded = await uploadOnCloudinary(avatars)
        const coverimageuploaded = await uploadOnCloudinary(coverimages)
        if (!avataruploaded || !coverimageuploaded) {
            throw new ApiError(400,"Both field are requried");
        }

        //6.
        const userCreation =await User.create({
            fullname,
            avatar:avataruploaded.url,
            username:username.toLowerCase(),
            coverImage:coverimageuploaded.secure_url,
            email,
            password
        })

        const userCreated=await User.findById(userCreation._id).select(
            "-password -refreshtoken"
        )
        if (!userCreated) {
            throw new ApiError(500,"Something went wrong while registering user")
        }

        return res
        .status(201)
        .json(
            new ApiResponse(201,userCreated,"User Registerd SucuessFully")
        )
    }
)


const loginUser = asyncHandler( async ( req , res ) => {
    //TODO's
    //req body -> data
    //username or email
    //find the user 
    //check password
    //access and refresh token generated
    //send cookie
    //send response

    //1.
    const {email,username,password}=req.body
    

    if (!(username || email)) {
        throw new ApiError(400,"Email is required to login!!")
    }
    if(!password){
        throw new ApiError(400,"Password is required to login!!")
    }
    
    //finding the user
    const user=await User.findOne({
        $or:[
            {username},
            {email}
        ]
    })
    if (!user){
        throw new ApiError(404,"User does not exist")
    }
    

    //checking password
    const ispasswordvalid = await user.isPasswordCorrect(password)

    if (!ispasswordvalid) {
        throw new ApiError(404,"Incorrect password")
    }

    //generate access and refresh tokens
    const {accesstoken,refreshtoken} = await generateAcessandRefreshTokens(user._id)

    //creating loggedin user object.
    const loggedinuser = await User.findById(user._id).select("-password -refreshtoken")

    console.log("Refresh token generated:", refreshtoken);

    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new ApiResponse(200,
            {
                user:loggedinuser,accesstoken,refreshtoken
            },
            "user logged in succuessfully")
    )

})

const logoutuser=asyncHandler(async(req,res)=>{
    if (!req.user) {
    throw new ApiError(401, "Unauthorized");
    }
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshtoken:1
            }
        },
        {
            new:true
        }
    )
    

    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const inComingRefreshToken = req.cookies?.refreshtoken || req.body?.refreshtoken;

    if(!inComingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }
    try {
        const checkingrefreshtoken = jwt.verify(inComingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(checkingrefreshtoken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid token");
        }
    
        if(inComingRefreshToken !== user?.refreshtoken){
            throw new ApiError(401,"Refresh token is expired or incorrect refresh token");
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accesstoken,refreshtoken}  = await generateAcessandRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accesstoken",accesstoken,options)
        .cookie("refreshtoken",refreshtoken,options)
        .json(
            new ApiResponse(200,
                {accesstoken,refreshtoken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token");
    }
})


const changecurrentpassword = asyncHandler(async (req,res)=>{
    const {oldpassword,newpassword} = req.body
    if (!oldpassword || !newpassword) {
        throw new ApiError(400,"Both fields are required")
    }

    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(400,"User must be logged in");
    }
    const isPasswordValid=await user.isPasswordCorrect(oldpassword)
    if (!isPasswordValid) {
        throw new ApiError(400,"Invalid user password")
    }

    user.password=newpassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password changed sucuessfully")
    )

})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"User fetched sucuessfully")
    )
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {email,fullname} = req.body
    if (!email || !fullname) {
        throw new ApiError(400,"Both fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {new:true}
    ).select("-password")

    if(!user){
        throw new ApiError(401,"User must be logged in...")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,user,"User details updated sucuessfully"))
})

const updateUserAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar is missing")
    }
    const upc = await uploadOnCloudinary(avatarLocalPath)
    if(!upc.url){
        throw new ApiError(400,"Error while uploading avatar");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:upc.url
            }
        },{new:true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"updated user avatar")
    )
})

const updateUsercoverimage = asyncHandler(async (req,res)=>{
    const LocalPathofcoverimage = req.file?.path

    if (!LocalPathofcoverimage) {
        throw new ApiError(400,"coverimage is missing")
    }
    const coverimageuploadation = await uploadOnCloudinary(LocalPathofcoverimage)
    if(!coverimageuploadation.url){
        throw new ApiError(400,"Error while uploading coverimage");
    }
    const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:coverimageuploadation.url
            }
        },{new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Updated cover images succuessfully...")
    )
})

const getuserchannelprofile = asyncHandler(async(req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }
    const channel = await User.aggregate([
        {
            $match:{
                username : username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelssubscribedtocount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if :{$in: [req.user?._id , "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                avatar:1,
                coverImage:1,
                subscribersCount:1,
                channelssubscribedtocount:1,
                isSubscribed:1
            }
        }

    ])
})

const watchhistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"videohistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owners",
                            pipeline:[{
                                $project:{
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owners"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchhistory,
            "WatchHistory fetched sucuessfully.."
        )
    )
})


export {
    registerUser,
    loginUser,
    logoutuser,
    refreshAccessToken,
    changecurrentpassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverimage,
    getuserchannelprofile,
    watchhistory
}

