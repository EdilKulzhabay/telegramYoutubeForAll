const mongoose = require("mongoose");

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
        payData: {
            date: {
                type:  Date
            },
            period: {
                type: String,
                default: ""
            }
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
);

module.exports = mongoose.model("User", UserSchema);