const express = require('express');
const router = express.Router();
const filesRouter = require('./files');
const AppError = require('../../utils/AppError');
const fs = require('fs/promises');
const {exec} = require('child_process');
const middleware = require('../../middleware');
const wrapAsync = require('../../utils/wrapAsync');

router.use('/projects/:id/files',filesRouter);

router.get('/projects/:id/run',middleware.ensureLogin,middleware.findProject,middleware.authorizeProject,wrapAsync(async (req,res) => {
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

router.use((req,res) => {
    throw new AppError('Not Found',404);
})

router.use((err,req,res,next) => {
    const {message,status = 500} = err;
    res.status(status).send(message);
})

module.exports = router;