const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/User');

router.get('/login',middleware.ensureNoLogin,(req,res) => {
    res.render('users/login');
})

router.post('/login',middleware.ensureNoLogin,passport.authenticate('local',{failureRedirect: '/login'}),(req,res) => {
    res.redirect('/projects');
})

router.get('/register',middleware.ensureNoLogin,(req,res) => {
    res.render('users/register');
})

router.post('/register',middleware.ensureNoLogin,wrapAsync(async (req,res,next) => {
    const {username,password} = req.body;
    const user = new User({username});
    await User.register(user,password);
    req.login(user,err => {
        if(err) next(err);
        else res.redirect('/projects');
    })
}))

router.post('/logout',middleware.ensureLogin,(req,res) => {
    req.logout();
    res.redirect('/');
})

module.exports = router;