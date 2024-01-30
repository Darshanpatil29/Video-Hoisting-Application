import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
          
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile=async(filePath)=>{
    console.log(filePath);
    try {
        if(!filePath){
            return null;
        }
       const response=await cloudinary.uploader.upload(filePath,{
            resource_type:"auto"
        });
        console.log("file uploaded on Cloudinary ",response.url);
        return response;
    } catch (error) {
        console.log(error);
        fs.unlinkSync(filePath);   // removes locally saved temporary file as upload operation failed
        return null;
    }
}

export {uploadFile}