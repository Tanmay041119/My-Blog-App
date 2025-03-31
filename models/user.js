const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const {createTokenForUser,validateToken} = require('../services/authentication');
const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,  // Fix typo: `require` ➝ `required`
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        salt: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        profileImageURL: {
            type: String,
            default: "./images/img1.png",
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return next();

    const salt = randomBytes(16).toString("hex");  
    const hashPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    user.salt = salt;
    user.password = hashPassword;
    next();
});

userSchema.static("matchPasswordAndCreateToken", async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) return { success: false, message: "User Not Found" };

    const userProvidedHash = createHmac("sha256", user.salt)
        .update(password)
        .digest("hex");
    if (user.password !== userProvidedHash)
        return { success: false, message: "Incorrect Password" };
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.salt;
    const token=createTokenForUser(user);

    return { success: true, token };
});

const User = mongoose.model("User", userSchema);
module.exports = User;
