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
        },
        email: {
            type: String,
            default: ""
        },
        invoiceId: {
            type: String,
            default: ""
        },
        currentMenu: { type: String, default: 'start' },  // Текущий экран меню
        history: { type: [String], default: [] } 
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", UserSchema);