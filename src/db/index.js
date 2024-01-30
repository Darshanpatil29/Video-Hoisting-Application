import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";


// const connectDB=async()=>{
//     try {
//        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//        console.log(`\n MongoDB Connected !! DB HOST:${connectionInstance.connection.host}`);
//     } catch (error) {
//         console.log("ERROR:",error);
//         process.exit(1);
//     }
// }


// using promises then/catch

const connectDB=()=>{
    return ( mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`) //promise
    .then((connectionInstance)=>{
        console.log(`\n MongoDB Connected !! DB HOST:${connectionInstance.connection.host}`);
    })
    .catch((error)=>{
        console.log("ERROR:",error);
        process.exit(1);
    })
    );
};

export default connectDB