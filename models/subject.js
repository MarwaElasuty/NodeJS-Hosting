const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
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
    status: {
        type: Number,
        default: 1
    },
    term: {
        type: Number,
        default: 1,
    },
    sort: {
        type: Number,
        default: 1000
    },
    image: {
        type: String,
        default: ""
    }


}, { timestamps: true })
subjectSchema.index({ name: 1 })
subjectSchema.index({ collage: 1 })

module.exports = mongoose.model('subject', subjectSchema);