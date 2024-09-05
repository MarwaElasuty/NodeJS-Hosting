const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        default: "",
    },
    collage: {
        type: Schema.Types.ObjectId,
        ref: "collage",
        default: null
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: "department",
        default: null
    },
    division: {
        type: Schema.Types.ObjectId,
        ref: "division",
        default: null
    },
    serial: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    status: {
        type: Number,
        default: 1
    },

}, { timestamps: true });

userSchema.index({ email: 1 })
userSchema.index({displayName:1})


userSchema.pre("save", async function(next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next()
    } catch (error) {
        next(error)
    }
})


userSchema.methods.isValidPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw (error)
    }
}

module.exports = mongoose.model("user", userSchema);