const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: true,
        default: ''
    }
})

module.exports = mongoose.model('File',fileSchema);