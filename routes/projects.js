const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const wrapAsync = require('../utils/wrapAsync');
const Project = require('../models/Project');
const File = require('../models/File');
const extensions = require('../config/extensions.json');
const User = require('../models/User');

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
    res.render('projects/show',{project: req.projectQuery, types: extensions[req.projectQuery.type]});
}))

router.delete('/:id',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
    await req.projectQuery.deleteOne();
    await req.user.update({$pull: {projects: req.params.id}});
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

module.exports = router;