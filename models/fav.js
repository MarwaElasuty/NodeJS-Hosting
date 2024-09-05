const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "course",
        required: true,
    },
    status: {
        type: Number,
        default: 1
    },


}, { timestamps: true })
favSchema.index({ createdAt: -1 })
favSchema.index({ course: -1 })


module.exports = mongoose.model('fav', favSchema);