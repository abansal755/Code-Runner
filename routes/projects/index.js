const express = require('express');
const router = express.Router();
const middleware = require('../../middleware');
const wrapAsync = require('../../utils/wrapAsync');
const Project = require('../../models/Project');
const filesRouter = require('./files');
const File = require('../../models/File');

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

router.delete('/:id',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    const project = await Project.findByIdAndDelete(req.params.id);
    for(const file of project.files) await File.deleteOne({_id: file});
    res.redirect('/projects');
}))

router.use('/:id/files',filesRouter);

module.exports = router;