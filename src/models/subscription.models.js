import mongoose,{ Schema } from "mongoose";
import { User } from "./user.models.js";

const subscriptionSchema=new Schema({
    subscriber:{         // no. of subscribers
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{            // Subscribed channels
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true});

export const Subscription=mongoose.model("Subscription",subscriptionSchema);