const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rateSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required:true,
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "course",
        required:true,
    },
    comment: {
        type: String,
        default: ""
    },
    rate: {
        type: Number,
        default: 0,
        min:0,
        max:5
    },
    status: {
        type: Number,
        default: 1
    },

}, { timestamps: true })
rateSchema.index({ createdAt: -1 })
rateSchema.index({ user: -1 })
rateSchema.index({ course: -1 })
rateSchema.index({ rate: -1 })


module.exports = mongoose.model('rate', rateSchema);