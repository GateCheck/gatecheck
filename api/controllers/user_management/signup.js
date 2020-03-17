const mongoose = require('mongoose');
const validator = require('validator').default;
const jwt = require('jsonwebtoken');
const { Student, Parent, Instructor, User } = require('../../models/index');

/**
 * Return null if no IDs or map all IDs into documents.
 * @param {String[]} ids the ids to map
 * @param {Model} model mongoose model for querying by id
 */
const nullOrMapDocumentReferences = (ids, model) => {
	if (ids === undefined || ids === null) return null;
	return ids.map((id) => model.findById(id));
};

/**
 * build the user model for signup
 * @param {Map} payload 
 * @param {String} type 
 * @param {String[]} instructorIDs 
 * @param {String[]} parentIDs 
 * @param {String[]} studentIDs 
 * @param {String[]} partnerIDs 
 * @param {String[]} childrenIDs 
 * @param {String} school 
 */
const buildModelSignup = (payload, type, instructorIDs, parentIDs, studentIDs, partnerIDs, childrenIDs, school) => {
	if (type === 'student') {
		payload.instructors = nullOrMapDocumentReferences(instructorIDs, Instructor);
		payload.parents = nullOrMapDocumentReferences(parentIDs, Instructor);
		payload.school = school;
		return new Student(payload);
	} else if (type === 'parent') {
		payload.children = nullOrMapDocumentReferences(childrenIDs, Instructor);
		payload.partners = nullOrMapDocumentReferences(partnerIDs, Instructor);
		return new Parent(payload);
	} else if (type === 'instructor') {
		payload.students = nullOrMapDocumentReferences(studentIDs, Instructor);
		payload.school = school;
		return new Instructor(payload);
	}

	throw new Error('Invalid user type: ' + type);
};

const createUser = async (type, data) => {
	const {
		loginUsername,
		phone,
		password,
		fullName,
		idNumber,
		instructorIDs,
		parentIDs,
		partnerIDs,
		studentIDs,
		childrenIDs,
		profilePicture,
		school
	} = data;
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
	const _type = type.toLowerCase();
	const payload = {
		_id,
		contact: {
			email: loginUsername,
			phone
		},
		loginUsername,
		password,
		full_name: fullName,
		id_number: idNumber,
		profile_picture: profilePicture
	};

	return buildModelSignup(payload, _type, instructorIDs, parentIDs, studentIDs, partnerIDs, childrenIDs, school);
};

exports.signup = async (req, res) => {
	const signupAs = req.params.signupAs.toLowerCase();
	let user;

	try {
		user = await createUser(signupAs, req.body);
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
	console.log(user.toJSON());
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
