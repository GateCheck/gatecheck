const { Parent } = require('../models/index');
const { removeConfidentialData } = require('../utils');


exports.get_parent = async (req, res) => {
    const parent = await Parent.findById(req.params.parentId);
    if (parent === null)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    const isInstructorRequesting = await parent.hasChildWithInstructorOfId(req.userData.userId);
    const allowAccess = req.user.administrative_level > 2 || // admin requesting
        req.userData.userId == req.params.parentId || // same user requesting
        await parent.hasChildWithId(req.userData.userId) || // child of parent requesting
        isInstructorRequesting // instructor of a child of the parent requesting
    if (!allowAccess)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    return res.status(200).json({
        success: true,
        message: 'Obtained parent\'s data',
        parent: removeConfidentialData(parent, req.user.administrative_level > 2 || req.userData.userId == req.params.parentId || isInstructorRequesting)
    });
}


exports.get_all_parents = async (req, res) => {
    const parents = [];
    if (req.user.administrative_level > 2) {
        Parent.find().then(parentDocs => {
            if (parentDocs !== null && parentDocs.length !== 0)
                parentDocs.forEach(parentDoc => parents.push(parentDoc));
        });
    }
    else if (req.user.modelName === 'Instructor' && req.user.students !== null && req.user.parents.length !== 0)
        req.user.students.forEach(student => {
            parents.push(...(student.parents.map(parentDoc => parents.push(parentDoc))));
        });
    else if (req.user.modelName === 'Parent' && req.user.partners !== null && req.user.parents.length !== 0) {
        req.user.partners.forEach(partnerDoc => parents.push(partnerDoc));
        parents.push(req.user)
    } else if (req.user.modelName === 'Student' && req.user.parents !== null && req.user.parents.length !== 0)
        req.user.parents.forEach(parentDoc => parents.push(parentDoc));
    else if (req.user.modelName === 'Parent')
        parents.push(req.user);

    res.status(200).json({
        success: true,
        parents: parents.map(parent => removeConfidentialData(parent, req.user.administrative_level > 2 || req.userData.userId == req.params.parentId))
    });
}

