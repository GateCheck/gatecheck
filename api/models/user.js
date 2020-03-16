const mongoose = require('mongoose');

/**
 * Base schema, later on extened upon to reduce amount of code and increase simplicity.
 * administrative_level is the user access level. what a user can access and view.
 */
const UserSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	contact: {
		email: { type: String, required: true, index: { unique: true } },
		phone: Number
	},
	username: { type: String, index: { unique: true } },
	password: { type: String, required: true },
	full_name: String,
	id_number: { type: Number, index: { unique: true } },
	profile_picture: String,
	administrative_level: Number
});

module.exports = {
	UserSchema: UserSchema
};
