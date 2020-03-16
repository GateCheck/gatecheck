const { Instructor, Parent, Student } = require('./models/index');

/**
 * Removes confidential information from documents passed down to the API and served to the user.
 * ensures sensitive data won't be shown when serving the data to the end user.
 * @param {Document} doc mongoose document
 * @param {Boolean} onlyPassword if true will only remove password from document json otherwise will remove ID and administrative level
 */
const removeConfidentialData = (doc, onlyPassword) => {
	const json = doc.toJSON();
	delete json.password;
	if (!onlyPassword) {
		delete json.id_number;
		delete json.administrative_level;
	}
	return json;
};

/**
 * Gets a users model name/type from his id
 * @param {String | mongoose.Types.ObjectId} id the id of the user to get
 * @returns {String} the type of the user (model name)
 */
const getUserTypeFromId = async (id) => {
	const student = await Student.exists({ _id: id });
	if (student) return 'Student';
	const instructor = await Instructor.exists({ _id: id });
	if (instructor) return 'Instructor';
	const parent = await Parent.exists({ _id: id });
	if (parent) return 'Parent';
	return null;
};

/**
 * Gets a generic user from his id. if user not found returns null.
 * @param {String | mongoose.Types.ObjectId} id the id of the user to get
 * @returns {Array<Document, String> | null} returns an array of the user document and type; [document, type]. if user not found returns null
 */
const getUserAndTypeFromId = async (userId) => {
	const student = await Student.findById(userId);
	if (student !== null) return [ student, 'Student' ];
	const instructor = await Instructor.findById(userId);
	if (instructor !== null) return [ instructor, 'Instructor' ];
	const parent = await Parent.findById(userId);
	if (parent !== null) return [ parent, 'Parent' ];
	return null;
};

module.exports = {
	removeConfidentialData,
	getUserAndTypeFromId,
	getUserTypeFromId
};
