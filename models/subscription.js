const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "course",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: null
    },
    status: {
        type: Number,
        default: 1
    },



}, { timestamps: true })
subscriptionSchema.index({ createdAt: -1 })
subscriptionSchema.index({ course: -1 })
subscriptionSchema.index({ user: -1 })

module.exports = mongoose.model('subscription', subscriptionSchema);