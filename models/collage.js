const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    nameEn: {
        type: String,
        default: ""
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
collageSchema.index({ name: 1 })

module.exports = mongoose.model('collage', collageSchema);