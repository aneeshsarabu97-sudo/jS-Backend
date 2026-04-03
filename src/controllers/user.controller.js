import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAcessandRefreshTokens = async(user_id)=>{
    try {
        const user = await User.findById(user_id)
        const accesstoken = user.generateAccessToken()
        const refreshtokens = user.generateRefreshToken()

        user.refreshtokens= refreshtokens
        await user.save({ validateBeforeSave:false })
        return {accesstoken,refreshtokens}
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

        return res.status(201).json(
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
    console.log(email)
    console.log(username)
    console.log(password)


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
    const {accesstoken,refreshtokens} = await generateAcessandRefreshTokens(user._id)

    //creating loggedin user object.
    const loggedinuser = await User.findById(user._id).select("-password -refreshtoken")

    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoke",refreshtokens,options)
    .json(
        new ApiResponse(200,
            {
                user:loggedinuser,accesstoken,refreshtokens
            },
            "user logged in succuessfully")
    )

})

const logoutuser=asyncHandler(async(req,res)=>{
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
    .clearCookie("refreshtoke",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const inComingRefreshToken = req.cookies.refreshtoken || req.body.refreshtoken

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
    
        const {aT,rT}  = await generateAcessandRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accesstoken",aT,options)
        .cookie("refreshtoken",rT,options)
        .json(
            new ApiResponse(200,
                {aT,rT},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token");
    }
})

export {
    registerUser,
    loginUser,
    logoutuser,
    refreshAccessToken
}

