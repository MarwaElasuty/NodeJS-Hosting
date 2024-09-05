const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const privacySchema = new Schema({
    link: {
        type: String,
        default: ""
    }
})


module.exports = mongoose.model('privacy', privacySchema);