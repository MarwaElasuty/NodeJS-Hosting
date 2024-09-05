const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    nameEn: {
        type: String,
        default: ""
    },
    collage: {
        type: Schema.Types.ObjectId,
        ref: "collage",
        required: true
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: "subject",
        required: true
    },
    division: {
        type: Schema.Types.ObjectId,
        ref: "division",
        required: true
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: "department",
        required: true
    },
    chapter: {
        type: Schema.Types.ObjectId,
        ref: "chapter",
        required: true
    },
    questions: {
        type: [Schema.Types.ObjectId],
        ref: "question",
        required: true
    },
    part: {
        type: Schema.Types.ObjectId,
        ref: "part",
        default: null
    },
    status: {
        type: Number,
        default: 1
    },
    sort: {
        type: Number,
        default: 1000
    },
    timer: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

quizSchema.index({ name: 1 })
quizSchema.index({ collage: 1 })
quizSchema.index({ subject: 1 })
quizSchema.index({ division: 1 })
quizSchema.index({ department: 1 })
quizSchema.index({ chapter: 1 })
quizSchema.index({ questions: 1 })
quizSchema.index({ part: 1 })







module.exports = mongoose.model('quiz', quizSchema);