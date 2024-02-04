import {v2 as cloudinary} from 'cloudinary';
import { log } from 'console';
import fs from 'fs'
          
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile=async(filePath)=>{
    try {
        if(!filePath){
            return null;
        }
       const response=await cloudinary.uploader.upload(filePath,{
            resource_type:"auto"
        });
        fs.unlinkSync(filePath);
        return response;
        
    } catch (error) {
        console.log(error);
        fs.unlinkSync(filePath);   // removes locally saved temporary file as upload operation failed
        return null;
    }
}

const deleteFile=async(fileUrl)=>{
    try{
        if(!fileUrl){
            return null;
        }
        const deletedResponse=await cloudinary.uploader.destroy(fileUrl,{resource_type})
        console.log(deletedResponse);
        return deletedResponse;
    }
    catch(error){
        console.log(error);
        return null;
    }
}

export {uploadFile,deleteFile}