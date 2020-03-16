const jwt = require('jsonwebtoken');
const { Student, Parent, Instructor } = require('../models/index');

const getUser = async (userId) => {
    const isStudent = await Student.exists({ _id: userId });
    const isInstructor = await Instructor.exists({ _id: userId });
    const isParent = await Parent.exists({ _id: userId });
    if (isStudent) return [await Student.findById(userId), 'Student'];
    else if (isInstructor) return [await Instructor.findById(userId), 'Instructor'];
    else if (isParent) return [await Parent.findById(userId), 'Parent'];
}

module.exports = (req, res, next) => {
    try {
        const decoded = jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_KEY);
        req.userData = decoded;
        getUser(decoded.userId).then(([ user, modelName ]) => {
            if (user === null) {
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            user.modelName = modelName;
            req.user = user;
            next();
        }).catch(err => {
            return res.status(401).json({
                message: 'Auth failed'
            })
        });
    } catch (err) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
}

