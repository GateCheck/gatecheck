const express = require('express');
const router = express.Router();
const { Parent } = require('../../models/index');
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

router.get("/parents", getUser, async (req, res) => {
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
        parents: req.user.administrative_level > 2 ? parents.map(parent => removeConfidentialData(parent, true)) : parents.map(parent => removeConfidentialData(parent, false))
    });
});


module.exports = router;
