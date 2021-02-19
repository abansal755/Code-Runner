const AppError = require('./utils/AppError');
const wrapAsync = require('./utils/wrapAsync');
const Project = require('./models/Project');
const File = require('./models/File');
const extensions = require('./config/extensions.json');

exports.ensureLogin = (req,res,next) => {
    if(req.isAuthenticated()) next();
    else throw new AppError('Please Login',401);
}

exports.ensureNoLogin = (req,res,next) => {
    if(req.isAuthenticated()) throw new AppError('Please logout', 403);
    next();
}

exports.findProject = wrapAsync(async (req,res,next) => {
    const project = await Project.findById(req.params.id);
    if(!project) throw new AppError('Project not found', 404);
    req.projectQuery = project;
    next();
})

exports.authorizeProject = wrapAsync(async (req,res,next) => {
    for(const project of req.user.projects){
        if(project.equals(req.projectQuery._id)){
            next();
            return;
        }
    }
    throw new AppError('Forbidden', 403);
})

exports.findFile = wrapAsync(async (req,res,next) => {
    const file = await File.findById(req.params.fileId);
    if(!file) throw new AppError('File not found', 404);
    req.fileQuery = file;
    next();
})

exports.authorizeFile = wrapAsync(async (req,res,next) => {
    for(const file of req.projectQuery.files){
        if(file.equals(req.fileQuery._id)){
            next();
            return;
        }
    }
    throw new AppError('Forbidden', 403);
})

exports.validateExtension = (req,res,next) => {
    for(const key in extensions){
        if(req.projectQuery.type === key){
            for(const ext of extensions[key]){
                if(req.body.extension === ext){
                    next();
                    return;
                }
            }
        }
    }
    throw new AppError('Invalid extension', 400);
}