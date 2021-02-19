if(process.env.NODE_ENV !== 'production') require('dotenv').config({path: './config/.env'});

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.listen(port,() => console.log(`Server is running on port ${port}`));

const mongoose = require('mongoose');
mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');
(async function(){
    const dbUrl = process.env.DB_URL || 'mongodb://localhost/CodeRunner';
    try{
        await mongoose.connect(dbUrl,{
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        console.log('MongoDB is running');
    }catch(err){
        console.log(err);
        process.exit(1);
    }
})();

const path = require('path');
const AppError = require('./utils/AppError');
const passport = require('passport');
const PassportLocal = require('passport-local');
const User = require('./models/User');
const session = require('express-session');
const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');
const methodOverride = require('method-override');
const apiRouter = require('./routes/api');

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method'));
app.use(session({
    name: 'session',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60*24*7
    }
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new PassportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.user = req.user;
    next();
})

app.get('/',(req,res) => {
    res.render('index');
})

app.use('/',usersRouter);
app.use('/projects',projectsRouter);
app.use('/api',apiRouter);

app.use((req,res) => {
    throw new AppError('Not Found',404);
})

app.use((err,req,res,next) => {
    const {message,status = 500} = err;
    res.status(status).render('error',{message,status});
})