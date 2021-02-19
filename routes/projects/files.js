const express = require('express');
const router = express.Router({mergeParams: true});
const middleware = require('../../middleware');
const File = require('../../models/File');
const wrapAsync = require('../../utils/wrapAsync');

router.get('/new',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,(req,res) => {
    res.render('projects/files/new',{project: req.projectQuery});
})

router.post('/',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    const file = new File({
        name: `${req.body.name}`,
        data: ''
    });
    await file.save();
    req.projectQuery.files.push(file);
    await req.projectQuery.save();
    res.redirect(`/projects/${req.projectQuery._id}`);
}))

router.get('/:fileId',middleware.ensureLogin,
    middleware.findProject,middleware.authorizeProject,
    middleware.findFile,middleware.authorizeFile,
    (req,res) => {
        res.render('projects/files/show',{file: req.fileQuery, project: req.projectQuery});
    }
)

router.put('/:fileId',middleware.ensureLogin,
    middleware.findProject,middleware.authorizeProject,
    middleware.findFile,middleware.authorizeFile,
    wrapAsync(async (req,res) => {
        const {name,data} = req.body;
        await req.fileQuery.update({
            name,
            data
        });
        res.redirect(`/projects/${req.projectQuery._id}/files/${req.fileQuery._id}`);
    })
)

router.delete('/:fileId',middleware.ensureLogin,
    middleware.findProject,middleware.authorizeProject,
    middleware.findFile,middleware.authorizeFile,
    wrapAsync(async (req,res) => {
        const file = await File.findByIdAndDelete(req.params.fileId);
        await req.projectQuery.update({$pull: {files: file._id}});
        res.redirect(`/projects/${req.projectQuery._id}`);
    })
)

module.exports = router;