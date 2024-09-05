const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoViwSchema = new Schema({
    video: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 1
    }
}, { timestamps: true })
videoViwSchema.index({ video : -1})

module.exports = mongoose.model('videoViw', videoViwSchema);