const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            default: ""
        },
        password: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Admin", AdminSchema);