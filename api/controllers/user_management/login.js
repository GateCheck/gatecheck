const jwt = require('jsonwebtoken');
const { getUserAndTypeFromId } = require('../../utils');
const { Student, Instructor, Parent } = require('../../models/index');

/**
 * Verify the user entered a correct password if he didnt, return false if he did, return the token
 * @param {Document} user the user document to be logged into if password is correct
 * @returns {Promise<Boolean> | Promise<null>} if login was not successful will return false otherwise will return the token.
 */
const authenticateAndGetToken = (user, password) => {
	return new Promise((resolve, reject) => {
		user.comparePassword(password, (err, success) => {
			err
				? resolve(null)
				: success
					? resolve(
							jwt.sign(
								{
									email: user.contact.email,
									fullName: user.full_name,
									school: user.school,
									profilePicture: user.profile_picture,
									userId: user._id
								},
								process.env.JWT_KEY,
								{
									expiresIn: '5h'
								}
							)
						)
					: resolve(null);
		});
	});
};

/**
 * Display the result of the login; whether it was successful or not.
 * @param {String | null} token the JWT token. null if login failed.
 * @param {*} res passed to set the json response for web client.
 * @returns {Promise<Boolean>} true if success false if failed.
 */
const showLoginResult = (token, res) => {
	if (token !== null) {
		res.status(200).json({
			success: true,
			message: 'Logged in',
			token
		});
		return true;
	}
	return false;
};

/**
 * Find a user using a single schema and then login.
 * @param {mongoose.schema} model mongoose schema to search user in for
 * @param {String} email user email to search for in order to get user to log in
 * @param {String} username user username to search for in order to get user to log in
 * @param {Number} id user id number to search for in order to get user to log in
 * @param {String} password password to test
 * @param {*} res passed to set the json response for web client if successful.
 * @returns {Promise<Boolean>} true if success false if failed.
 */
const findUserAndLoginWithSchema = async (model, email, username, id, password, res) => {
	let user = await model.findOne({
		$or: [ { 'contact.email': email }, { username: username }, { id_number: id } ]
	});
	if (user !== null) {
		const login = await authenticateAndGetToken(user, password);
		return showLoginResult(login, res);
	} else return false;
};

exports.login = async (req, res) => {
	const { username, email, password, id } = req.body;

	for (const model of [ Student, Parent, Instructor ]) {
		let success = await findUserAndLoginWithSchema(model, email, username, id, password, res);
		if (success) return;
	}
	
	if (!success) {
		res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	}
};

exports.delete_user = async (req, res) => {
	let allowAccess = req.user.administrative_level > 2 || req.user._id == req.params.userId;
	if (!allowAccess)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	const [ user, type ] = getUserAndTypeFromId(req.params.userId);
	user.remove().then((doc) => {
		res.status(200).json({
			success: true,
			message: `User of type: ${type} has been deleted!`,
			deletedUser: doc.toJSON()
		});
	});
};
