const express = require('express');
const moment = require('moment');
const mongoose = require('mongoose');
const router = express.Router();
const {
    Request,
    Student,
    Instructor
} = require('../../models/index');
const checkAuth = require('../../middleware/check-auth');

router.get("/request/:requestId", checkAuth, async (req, res) => {
    Request.findById(req.params.requestId).then(request => {
        if (request === null) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized" // for security reasons as to not let users brute force to get all document ids
            });
        }

        // find if access should be allowed to the user. if the user is an instructor check if he is an instructor of the student who made the request if not set to false 
        // otherwise if user is the maker of the request set true
        let accessAllowed = (await Instructor.isInstructor(req.userData.userId)) ? (await Instructor.findById(req.userData.userId)).isInstructorOfStudent(request.issuer._id) :
            request.issuer._id == req.userData.userId; // loose equals inorder to have type interpolation between string id and object id 


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


});

router.post("/request", checkAuth, async (req, res) => {
    const user = await Student.findById(req.userData.userId).exec();
    if (user === null) {
        return res.status(401).json({
            success: false,
            message: "You must be logged in to perform this action!"
        });
    }
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
        issuer: user,
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

});

router.delete("/request/:requestId", checkAuth, async (req, res) => {
    const request = await Request.findById(req.params.requestId);
    if (request === null) {
        return res.status(404).json({
            success: false,
            message: "Invalid resource ID"
        });
    }

    if (request.issuer._id == req.userData.userId || Instructor.exists({
        _id: req.userData.userId
    })) {
        Request.deleteOne({
            _id: request._id
        }).then(() => {
            res.status(204).json({
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
});



module.exports = router;