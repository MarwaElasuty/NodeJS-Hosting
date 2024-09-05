const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the Schema for the nested questions
const NestedQuestionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    // questionEn:{
    //     type:String,
    //     default:""
    // },
    answers: {
        type: [String],
        required: true
    },
    correctAnswer: {
        type: Number,
        required: true
    },
    degree: {
        type: Number,
        default: 1
    }
}, { _id: false });

const questionsSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    // questionEn:{
    //     type:String,
    //     default:""
    // },
    image: {
        type: String,
        default: ""
    },
    answers: {
        type: [String],
        default: []
    },
    correctAnswer: {
        type: Number,
        default: null
    },
    nestedQuestions: {
        type: [NestedQuestionSchema],
        default: []
    },
    difficulty: {
        type: Number,
        default: 1
    },
    degree: {
        type: Number,
        default: 1
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
    part: {
        type: Schema.Types.ObjectId,
        ref: "part",
        default: null
    },
    status: {
        type: Number,
        default: 1
    },
}, { timestamps: true })

questionsSchema.index({ createdAt: -1 })

questionsSchema.index({ collage: -1 })
questionsSchema.index({ subject: -1 })
questionsSchema.index({ division: -1 })
questionsSchema.index({ part: -1 })





module.exports = mongoose.model('questions', questionsSchema);