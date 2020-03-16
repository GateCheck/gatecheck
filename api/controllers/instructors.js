const { Instructor } = require('../models/index');
const { removeConfidentialData } = require('../utils');


exports.get_instructor = async (req, res) => {
    const instructor = await Instructor.findById(req.params.instructorId);
    if (instructor === null)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    let allowAccess = req.user.administrative_level > 2 || // admin requesting
        req.userData.userId == req.params.instructorId || // same user requesting
        instructor.isInstructorOfStudentWithIdOf(req.user._id) || // student of instructor requesting
        instructor.isInstructorOfChildWithParentIdOf(req.user._id); // parent requesting
    if (!allowAccess)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    return res.status(200).json({
        success: true,
        message: 'Obtained instructor\'s data',
        instructor: removeConfidentialData(instructor, req.user.administrative_level > 2 || req.userData.userId == req.params.parentId)
    });
}


exports.get_all_instructors = async (req, res) => {
    let instructors = [];
    if (req.user.administrative_level > 2) {
        Instructor.find().then(instructorDocs => {
            if (instructorDocs !== null && instructorDocs.length !== 0)
                instructorDocs.forEach(instructorDoc => instructors.push(instructorDoc));
        });
    } else if (req.user.modelName === 'Instructor') {
        instructors = await Instructor.findCoworkersByInstructor(req.user);
        instructors.push(req.user);
    } else if (req.user.modelName === "Parent" && req.user.children !== null && req.user.children.length > 0) {
        instructors = req.user.getChildrenInstructors();
    } else if (req.user.modelName === 'Student' && req.user.instructors !== null && req.user.instructors.length > 0) {
        instructors = req.user.instructors;
    }

    res.status(200).json({
        success: true,
        message: 'Instructors relating to user: ' + req.userData.fullName,
        instructors: instructors.map(instructor => removeConfidentialData(instructor, req.user.administrative_level > 2 || req.userData.userId == req.params.parentId))
    });
}
