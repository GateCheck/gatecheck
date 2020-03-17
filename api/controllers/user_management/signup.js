const mongoose = require('mongoose');
const validator = require('validator').default;
const jwt = require('jsonwebtoken');
const { Student, User } = require('../../models');

const createUser = async ({
	loginUsername,
	phone,
	password,
	fullName,
	idNumber,
	instructorIDs,
	parentsIDs,
	profilePicture,
	school
}) => {
	if (password.length < 8) {
		return 'Choose a stronger password!';
	} else if (!validator.isEmail(loginUsername)) {
		return 'Not a valid email!';
	}

	const userExists = await User.exists({ loginUsername });

	if (userExists) {
		return `User already exists!`;
	}

	const _id = new mongoose.Types.ObjectId();
	const payload = {
		_id,
		contact: {
			email: loginUsername,
			phone: phone || -1
		},
		loginUsername,
		password,
		full_name: fullName || null,
		id_number: idNumber || null,
		profile_picture: profilePicture || null,
		administrative_level: 1,
		school: school || null,
		instructors:
			instructorIDs !== null && instructorIDs !== undefined
				? instructorIDs.map(async (id) => await User.findById(id))
				: null,
		parents:
			parentsIDs !== null && parentsIDs !== undefined
				? parentsIDs.map(async (id) => await User.findById(id))
				: null
	};
	return new Student(payload);
};

exports.signup = async (req, res) => {
	let user;
	try {
		user = await createUser(req.body);
	} catch (err) {
		console.error(err);
		return res.status(400).json({
			success: false,
			error: err.message
		});
	}

	if (typeof user === typeof '') {
		return res.status(400).json({
			// show the reason the user was not created
			success: false,
			message: user
		});
	}

	user
		.save()
		.then((userDoc) => {
			// user was created successfully! show user data
			const token = jwt.sign(
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
			);
			const data = userDoc.toJSON();
			delete data.password;
			res.status(201).json({
				success: true,
				token,
				[userDoc.collection.name.slice(0, userDoc.collection.name.length - 1) + 'Created']: data
			});
		})
		.catch((err) => {
			console.error(err);
			res.status(401).json({
				success: false,
				message: 'Unauthorized'
			});
		});
};
