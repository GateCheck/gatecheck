const moment = require('moment');
const mongoose = require('mongoose');
const {
    Request
} = require('../models/index');

exports.get_request = async (req, res) => {
    Request.findById(req.params.requestId).then(async request => {
        if (request === null) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized" // for security reasons as to not let users brute force to get all document ids
            });
        }

        // find if access should be allowed to the user. if the user is an instructor check if he is an instructor of the student who made the request if not set to false 
        // otherwise if user is the maker of the request set true
        let accessAllowed = req.user.administrative_level > 2 || (req.modelName === 'Instructor' ? await req.user.isInstructorOfId(request.issuer._id) : request.issuer._id == req.userData.userId);

        if (accessAllowed) {
            res.status(200).json({
                success: true,
                message: "Found resource",
                request
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
    }).catch(err => {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message,
            error: err
        })
    });
}

exports.create_request = async (req, res) => {
    const {
        details,
        reason,
        title,
        goLocation
    } = req.body;

    const request = new Request({
        _id: new mongoose.Types.ObjectId(),
        accepted: false,
        accepted: null,
        details,
        issuedDate: moment.now(),
        issuer: req.user,
        reason,
        title,
        validTill: moment().add(moment.duration({
            day: 1
        })).get(),
        goLocation,
        backAtSchoolTime: null
    });

    request.save().then(doc => {
        res.status(201).json({
            success: true,
            message: "Created request!",
            request: doc.toJSON()
        });
    }).catch(err => {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to save resource",
            error: err
        });
    });

}

exports.delete_request = async (req, res) => {
    const request = await Request.findById(req.params.requestId);
    if (request === null) {
        return res.status(404).json({
            success: false,
            message: "Invalid resource ID"
        });
    }

    if (req.user.administrative_level > 2 || request.issuer._id === req.user._id) { // loose equals inorder to have type interpolation between string id and object id 
        Request.deleteOne({
            _id: request._id
        }).then(() => {
            res.status(200).json({
                success: true,
                message: "Deleted resource",
                request
            });
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
}


exports.get_all_requests = async (req, res) => {
    const query = Request.find();

    if (req.user.administrative_level > 2)
        query.then(requestDocs => {
            res.status(200).json({
                success: true,
                message: "Requests made by: " + req.userData.fullName,
                requests: requestDocs.map(requestDoc => requestDoc.toJSON())
            });
        })
    else
        query.where({ issuer: req.user._id }).then(requestDocs => {
            res.status(200).json({
                success: true,
                message: "Requests made by: " + req.userData.fullName,
                requests: requestDocs.map(requestDoc => requestDoc.toJSON())
            });
        });
}