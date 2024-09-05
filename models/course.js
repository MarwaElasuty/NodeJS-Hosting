const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { courseStatus } = require('../types/types')
const courseSchema = new Schema({
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
    department: {
        type: Schema.Types.ObjectId,
        ref: "department",
        required: true
    },
    division: {
        type: Schema.Types.ObjectId,
        ref: "division",
        required: true
    },
    chapters: {
        type: [Schema.Types.ObjectId],
        ref: "chapter",
        default: []
    },
    pdf: {
        type: [String],
        default: []
    },
    status: {
        type: Number,
        default: courseStatus.public
    },
    sort: {
        type: Number,
        default: 1000
    },
    description: {
        type: String,
        default: ""
    },
    cover: {
        type: String,
        default: ""
    },
    // get from rating collection;
    rating: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    term: {
        type: Number,
        default: 1,
    },
    // get from fav list
    inFav: {
        type: Boolean,
        default: false,
    },
    isSubscriber: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        default: 0
    },
    hours: {
        type: Number,
        default: 0
    },
    videosLength: {
        type: Number,
        default: 0
    },
    subscribers: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

courseSchema.index({ createdAt: -1 })
courseSchema.index({ collage: 1 })
courseSchema.index({ subject: 1 })
courseSchema.index({ department: 1 })
courseSchema.index({ division: 1 })
courseSchema.index({ chapters: 1 })
courseSchema.index({ isSubscriber: 1 })









module.exports = mongoose.model('course', courseSchema);