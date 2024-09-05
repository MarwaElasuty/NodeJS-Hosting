const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    role: String,
    userId: Schema.Types.ObjectId
}, { timestamps: true })

module.exports = mongoose.model('role', roleSchema);