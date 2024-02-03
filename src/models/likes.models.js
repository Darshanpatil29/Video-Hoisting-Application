import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Video } from "./videos.models.js";
import { User } from "./user.models.js";
import { Comment } from "./comments.models.js";
import { Tweet } from "./tweets.models.js";
const likesSchema=new Schema({
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    }

},{timestamps:true});

export const Like=new mongoose.model("Like",likesSchema);