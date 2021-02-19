const express = require('express');
const router = express.Router();
const wrapAsync = require('../../utils/wrapAsync');
const middleware = require('../../middleware');
const Project = require('../../models/Project');
const File = require('../../models/File');
const {exec} = require('child_process');
const fs = require('fs/promises');

router.get('/',middleware.ensureLogin,wrapAsync(async (req,res) => {
    await req.user.populate('projects').execPopulate();
    res.send(req.user.projects);
}))

router.post('/',middleware.ensureLogin,wrapAsync(async (req,res) => {
    const project = new Project(req.body);
    await project.save();
    req.user.projects.push(project);
    await req.user.save();
    res.send('');
}))

router.get('/:id',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    await req.projectQuery.populate('files').execPopulate();
    res.send(req.projectQuery);
}))

router.delete('/:id',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    await Project.deleteOne({_id: req.projectQuery._id})
    for(const file of req.projectQuery.files) await File.deleteOne({_id: file});
    res.send('');
}))

router.patch('/:id',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    await req.projectQuery.update({
        name: req.body.name,
        start: req.body.start
    });
    res.send('');
}))

router.get('/:id/run',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    await fs.mkdir(`./files/${req.projectQuery._id}`,{recursive: true});
    await req.projectQuery.populate('files').execPopulate();
    for(const file of req.projectQuery.files) await fs.writeFile(`./files/${req.projectQuery._id}/${file.name}`,file.data);
    exec(`cd files/${req.projectQuery._id} && ${req.projectQuery.start}`,async (error,stdout,stderr) => {
        let consoleData;
        if(error) consoleData = stderr;
        else consoleData = stdout;
        res.send(consoleData);
    })
}))

module.exports = router;