const jwt = require('jsonwebtoken');
const { getUserAndTypeFromId } = require('../../utils');
const { User } = require('../../models/index');

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

exports.login = async (req, res) => {
	const { loginUsername, password } = req.body;

	const user = await User.findOne({ 'loginUsername': loginUsername });

	const token = await authenticateAndGetToken(user, password);

	token !== null
		? res.status(200).json({
				success: true,
				message: 'Logged in',
				token
			})
		: res.status(401).json({
				success: false,
				message: 'Unauthorized'
			});
};

exports.delete_user = async (req, res) => {
	let allowAccess = req.user.administrative_level > 2 || req.user._id == req.params.userId;
	if (!allowAccess)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	const user = User.findById(req.params.userId);
	user.remove().then((doc) => {
		res.status(200).json({
			success: true,
			message: `User of type: ${user.kind} has been deleted!`,
			deletedUser: doc.toJSON()
		});
	});
};
