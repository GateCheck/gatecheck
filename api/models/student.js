const mongoose = require('mongoose');
const { extendSchema } = require('../../utils');
const { UserSchema: userSchema } = require('./user');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

const StudentSchema = extendSchema(userSchema, {
	instructors: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Instructor'
		}
	],
	parents: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Parent'
		}
	],
	school: String
});

// Password hashing (encrypting)
StudentSchema.pre('save', function(next) {
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
StudentSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

/**
 * Checks whether or not the student in the `this` context has a parent with the id given
 * @param {String} id the id to compare against
 * @returns {Promise<Boolean>} true if the student given in the `this` context has a parent with the id given.
 */
StudentSchema.methods.hasParentWithIdOf = function(id) {
	return new Promise((resolve, reject) => {
		if (this.parents === null || this.parents.length < 1) return resolve(false);
		for (const parent of this.parents) {
			if (parent._id == id) return resolve(true);
		}
		return resolve(false);
	});
};

/**
 * Checks whether or not the student in the `this` context has an instructor with the id given
 * @param {String} id the id to compare against
 * @returns {Promise<Boolean>} true if the student given in the `this` context has an instructor with the id given.
 */
StudentSchema.methods.hasInstructorWithIdOf = function(id) {
	return new Promise((resolve, reject) => {
		if (this.instructors === null || this.instructors.length < 1) return resolve(false);
		for (const instructor of this.instructors) {
			if (instructor._id == id) return resolve(true);
		}
		return resolve(false);
	});
};

const studentModel = mongoose.model('Student', StudentSchema, 'students');

module.exports = studentModel;
