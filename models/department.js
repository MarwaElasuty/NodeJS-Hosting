const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
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
    sort: {
        type: Number,
        default: 1000
    }
}, { timestamps: true })
departmentSchema.index({ name: 1 })
departmentSchema.index({ department: 1 })

module.exports = mongoose.model('department', departmentSchema);