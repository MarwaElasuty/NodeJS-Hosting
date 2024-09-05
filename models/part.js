const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partSchema = new Schema({
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
    videos: {
        type: [String],
        default: []
    },
    pdf: {
        type: [String],
        default: []
    },
    // quiz
    status: {
        type: Number,
        default: 1
    },
    sort: {
        type: Number,
        default: 1000
    }
}, { timestamps: true })

partSchema.index({ name: 1 })
partSchema.index({ collage: 1 })
partSchema.index({ subject: 1 })
partSchema.index({ division: 1 })
partSchema.index({ department: 1 })
partSchema.index({ chapter: 1 })







module.exports = mongoose.model('part', partSchema);