const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chapterSchema = new Schema({
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
    status: {
        type: Number,
        default: 1
    },
    sort: {
        type: Number,
        default: 1000
    }
}, { timestamps: true })

chapterSchema.index({ name: 1 })
chapterSchema.index({ collage: 1 })
chapterSchema.index({ subject: 1 })
chapterSchema.index({ division: 1 })
chapterSchema.index({ department: 1 })

module.exports = mongoose.model('chapter', chapterSchema);