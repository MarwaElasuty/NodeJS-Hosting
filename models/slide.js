const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const slideSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "course",
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
    collage: {
        type: Schema.Types.ObjectId,
        ref: "collage",
        default: null
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: "subject",
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
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    }

}, { timestamps: true })
slideSchema.index({ course: 1 })
slideSchema.index({ collage: 1 })
slideSchema.index({ subject: 1 })
slideSchema.index({ department: 1 })
slideSchema.index({ division: 1 })

module.exports = mongoose.model('slide', slideSchema);