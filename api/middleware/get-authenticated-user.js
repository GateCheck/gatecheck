const jwt = require('jsonwebtoken');
const { getUserAndTypeFromId } = require('../utils');
const { User } = require('../models');

module.exports = (req, res, next) => {
	try {
		const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_KEY);
		req.userData = decoded;
		User.findById(decoded.userId)
			.then((user) => {
				if (user === null) {
					return res.status(401).json({
						message: 'Auth failed'
					});
				}
				user.modelName = user.kind;
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
