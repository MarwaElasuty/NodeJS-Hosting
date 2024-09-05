const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoUserViewSchema = new Schema({
    video: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 1
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: "user",
        default:null
    }
}, { timestamps: true })
videoUserViewSchema.index({ user: -1 })
videoUserViewSchema.index({ video : -1})

module.exports = mongoose.model('videoUserView', videoUserViewSchema);