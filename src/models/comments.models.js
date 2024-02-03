import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Video } from "./videos.models.js";
import { User } from "./user.models.js";
const commentsSchema=new Schema({
    content:{
        type:String,
        required:true,
        trim:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    }
},{timestamps:true});


commentsSchema.plugin(mongooseAggregatePaginate);
export const Comment=new mongoose.model("Comment",commentsSchema);