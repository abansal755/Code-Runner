const express = require('express');
const router = express.Router({mergeParams: true});
const middleware = require('../../middleware');
const wrapAsync = require('../../utils/wrapAsync');
const File = require('../../models/File');

router.get('/',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    // await req.projectQuery.populate('files').execPopulate();
    res.send(req.projectQuery.files);
}))

router.post('/',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,middleware.validateExtension,wrapAsync(async (req,res) => {
    const file = new File({name: `${req.body.name}.${req.body.extension}`});
    await file.save();
    req.projectQuery.files.push(file);
    await req.projectQuery.save();
    res.send(file);
}))

router.get('/:fileId',middleware.ensureLogin,
    middleware.findProject,middleware.authorizeProject,
    middleware.findFile,middleware.authorizeFile,
    wrapAsync(async (req,res) => {
        res.send(req.fileQuery);
    })
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
        res.send('');
    })
)

router.delete('/:fileId',middleware.ensureLogin,
    middleware.findProject,middleware.authorizeProject,
    middleware.findFile,middleware.authorizeFile,
    wrapAsync(async (req,res) => {
        await File.deleteOne({_id: req.fileQuery._id});
        await req.projectQuery.update({$pull: {files: req.fileQuery._id}});
        res.send('');
    })
)

module.exports = router;