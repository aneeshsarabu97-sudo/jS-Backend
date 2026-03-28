import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


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
        console.log("fullName:",fullname);
        console.log("email:",email);
        console.log("userName:",username);
        console.log("Password:",password);

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
});
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
    })



export {registerUser}