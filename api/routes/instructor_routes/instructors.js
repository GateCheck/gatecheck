const express = require('express');
const router = express.Router();
const {
    Instructor
} = require('../../models/index');
const getUser = require('../../middleware/get-user');


const removeConfidentialData = (doc, onlyPassword) => {
    const json = doc.toJSON();
    delete json.password;
    if (!onlyPassword) {
        delete json.id_number;
        delete json.administrative_level;
    }
    return json;
}

router.get("/instructors", getUser, async (req, res) => {
    const instructors = [];
    if (req.user.administrative_level > 2) {
        Instructor.find().then(instructorDocs => {
            if (instructorDocs !== null && instructorDocs.length !== 0)
                instructorDocs.forEach(instructorDoc => instructors.push(instructorDoc));
        });
    } else if (req.user.modelName === 'Instructor') {
        instructors = await req.user.getIntructorCoWorkers();
        instructors.push(req.user);
    } else if (req.user.modelName === "Parent" && req.user.children !== null && req.user.children.length > 0) {
        instructors = req.user.getChildrenInstructors();
    } else if (req.user.modelName === 'Student' && req.user.instructors !== null && req.user.instructors.length > 0) {
        instructors = req.user.instructors;
    }

    res.status(200).json({
        success: true,
        message: 'Instructors relating to user: ' + req.userData.fullName,
        instructors: req.user.administrative_level > 2 ? instructors.map(instructor => removeConfidentialData(instructor, true)) : instructors.map(instructor => removeConfidentialData(instructor, false))
    });
});



module.exports = router;
