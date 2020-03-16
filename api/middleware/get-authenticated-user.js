const jwt = require('jsonwebtoken');
const { Student, Parent, Instructor } = require('../models/index');

const getUser = async (userId) => {
	const student = await Student.findById(userId);
	const instructor = await Instructor.findById(userId);
	const parent = await Parent.findById(userId);
	if (student !== null) return [ student, 'Student' ];
	else if (instructor !==  null) return [ instructor, 'Instructor' ];
	else if (parent !== null) return [ parent, 'Parent' ];
};

module.exports = (req, res, next) => {
	try {
		const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_KEY);
		req.userData = decoded;
		getUser(decoded.userId)
			.then(([ user, modelName ]) => {
				if (user === null) {
					return res.status(401).json({
						message: 'Auth failed'
					});
				}
				user.modelName = modelName;
				req.user = user;
				next();
			})
			.catch((err) => {
				return res.status(401).json({
					message: 'Auth failed'
				});
			});
	} catch (err) {
		return res.status(401).json({
			message: 'Auth failed'
		});
	}
};
