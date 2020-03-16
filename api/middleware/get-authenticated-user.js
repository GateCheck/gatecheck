const jwt = require('jsonwebtoken');
const { getUserAndTypeFromId } = require('../utils');

module.exports = (req, res, next) => {
	try {
		const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_KEY);
		req.userData = decoded;
		getUserAndTypeFromId(decoded.userId)
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
