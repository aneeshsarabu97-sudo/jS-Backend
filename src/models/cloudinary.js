import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUDNAME,
    api_key:process.env.CLOUDINARY_APIKEY,
    api_secret:process.env.CLOUDINARY_APISECRET
});

const uploadOnCloudinary=async (localfilepath)=>{
    try{
        if (!localfilepath) return null;
        const response = await cloudinary.uploader.upload(localfilepath,{resource_type:"auto"});
        console.log("File upload sucuessfully on cloudinary",response.secure_url)
        if (fs.existsSync(localfilepath)){
            fs.unlinkSync(localfilepath)
        }

        return response;
    }catch(error){
        if (fs.existsSync(localfilepath)){
            fs.unlinkSync(localfilepath)
        }
        return null;
    }
}

export {uploadOnCloudinary}