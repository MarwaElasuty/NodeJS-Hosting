const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const termsSchema = new Schema({
    link: {
        type: String,
        default: ""
    }
})


module.exports = mongoose.model('terms', termsSchema);