const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizResultSchema = new Schema({

    status: {
        type: Number,
        default: 1
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: "quiz",
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    degree: {
        type: Number,
        default: 0
    },
    maxDegree: {
        type: Number,
        default: 100
    },
    startTime: {
        type: Date,
        default: null,
    },
    endTime: {
        type: Date,
        default: null,
    },
    wrong:{
        type: [Number],
        default:[]
    }


}, { timestamps: true })

quizResultSchema.index({ name: 1 })
quizResultSchema.index({ quiz: 1 })
quizResultSchema.index({ user: 1 })

module.exports = mongoose.model('quizResult', quizResultSchema);