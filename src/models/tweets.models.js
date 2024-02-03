import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "./user.models.js";

const tweetsSchema=new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        trim:true,
        required:true
    }
},{timestamps:true});

tweetsSchema.plugin(mongooseAggregatePaginate);
export const Tweet=new mongoose.model("Tweet",tweetsSchema);