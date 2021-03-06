var mongoose = require('mongoose'),
    Upload = mongoose.model('Upload');

// ERROR HANDLING
var getErrorMessage = function(err) {
    if (err.errors) {
        for (var errName in err.errors) {
            if (err.errors[errName].message) return err.errors[errName].message;
        }
    }
    else {
        return 'Unknown server error';
    }
};

// CHECK AUTHORIZATION
exports.hasAuthorization = function(req, res, next) {
    if (req.upload.creator.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};

// CREATE
exports.create = function(req, res) {
    var upload = new Upload(req.body);

    //this is the authenticated Passport user
    upload.creator = req.user;

    upload.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(upload);
        }
    });
};

//LIST/READ
exports.list = function(req, res) {
    Upload.find().sort('-created').populate('creator', 'firstName   lastName fullName').exec(function(err, uploads) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(uploads);
        }
    });
};

//FIND BY ID
exports.uploadByID = function(req, res, next, id) {
    Upload.findById(id).populate('creator', 'firstName lastName fullName').exec(function(err, upload) {
        if (err) return next(err);
        if (!upload) return next(new Error('Failed to load upload ' + id));

        req.upload = upload;
        next();
    });
};

//READ
exports.read = function(req, res) {
    res.json(req.upload);
};

//UPDATE
exports.update = function(req, res) {
    var upload = req.upload;

    //makeupdates to title and content
    upload.title = req.body.title;
    upload.content = req.body.content;

    //call save on the Mongoose model
    upload.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(upload);
        }
    });
};

//DELETE
exports.delete = function(req, res) {
    var upload = req.upload;

    upload.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(upload);
        }
    });
};
