const mongoose = require("mongoose");

let userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    passHash: { type: String, required: true },
    favorites:  [{
        googleId: { type: String, required: true },
        name: { type: String, required: true },
        comments:  [{
            author: String,
            text: String,
            postDate: Date
        }]
    }]
});

let User = mongoose.model("user", userSchema);
module.exports = User;