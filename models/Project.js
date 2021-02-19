const mongoose = require('mongoose');
const extensions = require('../config/extensions.json');

const types = [];
for(const key in extensions) types.push(key);

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: types
    },
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    start: {
        type: String,
        required: true,
        default: ''
    }
})

module.exports = mongoose.model('Project',projectSchema);