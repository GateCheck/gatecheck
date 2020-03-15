const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
    Student,
    Instructor
} = require('../../models/index');
const validator = require('validator').default;

// get instructor from db
router.get("/instructor/:id", (req, res) => {
    const id = req.params.id;
    if (id === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Database ID'
        });
    }
    Instructor.findById(id).exec().then(instructorDoc => {
        const instructor = instructorDoc.toJSON();
        delete instructor.password;
        res.status(200).json({
            success: true,
            instructor
        });
    }).catch(err => {
        console.error(err);
        res.status(400).json({
            success: false,
            error: `Couldn't find a document with ID "${id}".`
        });
    });
});

// get instructor by real id or email or username
router.get("/instructor", (req, res) => {
    const chosen = req.query.id || req.query.email || req.query.username;
    if (req.query.id !== undefined || req.query.email !== undefined || req.query.username !== undefined) {

        const cond = req.query.id !== undefined ? {
            id_number: Number.parseInt(chosen)
        } : req.query.email !== undefined ? {
            "contact.email": chosen

        } : {
            username: chosen
        };

        Instructor.findOne(cond).then(instructorDoc => {
            const instructor = instructorDoc.toJSON();
            delete instructor.password;
            res.status(200).json({
                success: true,
                instructor
            });
        }).catch(err => {
            console.error(err);
            res.status(400).json({
                success: false,
                error: "Can't find user."
            })
        });
    } else {
        res.status(400).json({
            success: false,
            error: "Pass a username, email or id in the query."
        })
    }
});

module.exports = router;