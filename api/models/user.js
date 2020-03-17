const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;

const options = { discriminatorKey: 'kind' };

/**
 * Base schema, later on extened upon to reduce amount of code and increase simplicity.
 * administrative_level is the user access level. what a user can access and view.
 */
const UserSchema = mongoose.Schema(
	{
		_id: mongoose.Schema.Types.ObjectId,
		contact: {
			email: { type: String, required: true, index: { unique: true } },
			phone: { type: Number, default: -1, required: false }
		},
		loginUsername: { type: String, required: true, index: { unique: true } },
		password: { type: String, required: true },
		full_name: { type: String, default: null, required: false },
		id_number: { type: Number, default: null, required: false },
		profile_picture: { type: String, default: null, required: false },
		administrative_level: { type: Number, default: 1, enum: [ 1, 2, 3 ], required: false }
	},
	options
);

// Password hashing (encrypting)
UserSchema.pre('save', function(next) {
	var user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		// hash the password using our new salt
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

/**
 * Compare the password of a user to the password passed
 * @param {String} candidatePassword the password compared to the hash
 * @param {Function} cb the function called when finishing comparasion. first argument is if an error occurred second is if password is correct or not
 */
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

const User = mongoose.model('User', UserSchema, 'users');

module.exports = {
	UserSchema,
	User
};
