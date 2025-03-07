import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        chatId: {
            type: String,
            default: ""
        },
        channelAccess: {
            type: Boolean,
            default: false
        },
        payDate: {
            type: Date
        },
        refferal: {
            type: String,
            default: "",
        },
        refferalBonus: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model("User", UserSchema)