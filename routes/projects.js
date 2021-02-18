const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const wrapAsync = require('../utils/wrapAsync');
const Project = require('../models/Project');
const File = require('../models/File');

router.get('/',middleware.ensureLogin,wrapAsync(async (req,res) => {
    await req.user.populate('projects').execPopulate();
    res.render('projects/index');
}))

router.get('/new',middleware.ensureLogin,(req,res) => {
    res.render('projects/new');
})

router.post('/',middleware.ensureLogin,wrapAsync(async (req,res) => {
    const project = new Project(req.body);
    await project.save();
    req.user.projects.push(project);
    await req.user.save();
    res.redirect(`/projects/${project._id}`);
}))

router.get('/:id',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    await req.projectQuery.populate('files').execPopulate();
    res.render('projects/show',{project: req.projectQuery});
}))

router.get('/:id/files/new',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,(req,res) => {
    res.render('projects/files/new',{project: req.projectQuery});
})

router.post('/:id/files',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    const file = new File({
        name: `${req.body.name}`,
        data: ''
    });
    await file.save();
    req.projectQuery.files.push(file);
    await req.projectQuery.save();
    res.redirect(`/projects/${req.projectQuery._id}`);
}))

router.get('/:id/files/:fileId',middleware.ensureLogin,
    middleware.findProject,middleware.authorizeProject,
    middleware.findFile,middleware.authorizeFile,
    (req,res) => {
        res.render('projects/files/show',{file: req.fileQuery, project: req.projectQuery});
    }
)

router.put('/:id/files/:fileId',middleware.ensureLogin,
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

module.exports = router;