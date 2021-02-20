const express = require('express');
const router = express.Router();
const filesRouter = require('./files');
const AppError = require('../../utils/AppError');

router.use('/projects/:id/files',filesRouter);

router.use((req,res) => {
    throw new AppError('Not Found',404);
})

router.use((err,req,res,next) => {
    const {message,status = 500} = err;
    res.status(status).send(message);
})

module.exports = router;