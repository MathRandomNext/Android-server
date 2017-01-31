const mongoose = require("mongoose");
const encryption = require("../utils/encryption");

let userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    salt: { type: String, required: true },
    passHash: { type: String, required: true },
});

userSchema.methods = {
    isValidPassword(password) {
        // let realPassHash = this.passHash;
        // let currentPassHash = encryption.getPassHash(this.salt, password);
        // let isValid = currentPassHash === realPassHash;

        //return isValid;

        return true;
    }
};

let User = mongoose.model("user", userSchema);
module.exports = User;