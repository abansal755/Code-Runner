const express = require('express');
const router = express.Router({mergeParams: true});
const middleware = require('../../middleware');
const File = require('../../models/File');
const wrapAsync = require('../../utils/wrapAsync');
const path = require('path');
const extensions = require('../../config/extensions.json');

router.get('/new',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,(req,res) => {
    const types = extensions[req.projectQuery.type];
    res.render('projects/files/new',{project: req.projectQuery, types});
})

router.post('/',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,middleware.validateExtension,wrapAsync(async (req,res) => {
    const file = new File({name: `${req.body.name}.${req.body.extension}`});
    await file.save();
    req.projectQuery.files.push(file);
    await req.projectQuery.save();
    res.redirect(`/projects/${req.projectQuery._id}`);
}))

router.get('/:fileId',middleware.ensureLogin,
    middleware.findProject,middleware.authorizeProject,
    middleware.findFile,middleware.authorizeFile,
    (req,res) => {
        const types = extensions[req.projectQuery.type];
        const ext = path.extname(req.fileQuery.name);
        const name = path.basename(req.fileQuery.name,ext);
        req.fileQuery.name = name;
        req.fileQuery.extension = ext.substr(1);
        res.render('projects/files/show',{file: req.fileQuery, project: req.projectQuery, types});
    }
)

router.put('/:fileId',middleware.ensureLogin,
    middleware.findProject,middleware.authorizeProject,
    middleware.findFile,middleware.authorizeFile,
    middleware.validateExtension,
    wrapAsync(async (req,res) => {
        await req.fileQuery.update({
            name: `${req.body.name}.${req.body.extension}`,
            data: req.body.data
        });
        res.redirect(`/projects/${req.projectQuery._id}/files/${req.fileQuery._id}`);
    })
)

router.delete('/:fileId',middleware.ensureLogin,
    middleware.findProject,middleware.authorizeProject,
    middleware.findFile,middleware.authorizeFile,
    wrapAsync(async (req,res) => {
        await File.deleteOne({_id: req.fileQuery._id});
        await req.projectQuery.update({$pull: {files: req.fileQuery._id}});
        res.redirect(`/projects/${req.projectQuery._id}`);
    })
)

module.exports = router;