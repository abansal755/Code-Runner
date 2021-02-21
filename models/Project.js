const mongoose = require('mongoose');
const extensions = require('../config/extensions.json');
const File = require('./File');
const wrapHook = require('../utils/wrapHook');

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

projectSchema.post('deleteOne',{document: true, query: false},wrapHook.post(async project => {
    for(const file of project.files) await File.deleteOne({_id: file});
}))

module.exports = mongoose.model('Project',projectSchema);