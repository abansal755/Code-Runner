const express = require('express');
const router = express.Router();
const middleware = require('../../middleware');
const wrapAsync = require('../../utils/wrapAsync');
const Project = require('../../models/Project');
const filesRouter = require('./files');
const File = require('../../models/File');
const extensions = require('../../config/extensions.json');
const {exec} = require('child_process');
const fs = require('fs/promises');

router.get('/',middleware.ensureLogin,wrapAsync(async (req,res) => {
    await req.user.populate('projects').execPopulate();
    res.render('projects/index');
}))

router.get('/new',middleware.ensureLogin,(req,res) => {
    const types = [];
    for(const key in extensions) types.push(key);
    res.render('projects/new',{types});
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
    await Project.deleteOne({_id: req.projectQuery._id})
    for(const file of req.projectQuery.files) await File.deleteOne({_id: file});
    res.redirect('/projects');
}))

router.get('/:id/settings',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,(req,res) => {
    res.render('projects/settings',{project: req.projectQuery});
})

router.patch('/:id',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    await req.projectQuery.update({
        name: req.body.name,
        start: req.body.start
    });
    res.redirect(`/projects/${req.projectQuery._id}`);
}))

router.get('/:id/run',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    await fs.mkdir(`./files/${req.projectQuery._id}`,{recursive: true})
    await req.projectQuery.populate('files').execPopulate();
    for(const file of req.projectQuery.files) await fs.writeFile(`./files/${req.projectQuery._id}/${file.name}`,file.data);
    exec(`cd files/${req.projectQuery._id} && ${req.projectQuery.start}`,async (error,stdout,stderr) => {
        let consoleData;
        if(error) consoleData = stderr;
        else consoleData = stdout;
        res.render('projects/run',{consoleData, project: req.projectQuery});
    })
}))

router.use('/:id/files',filesRouter);

module.exports = router;