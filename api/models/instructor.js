const mongoose = require('mongoose');
const { UserSchema: userSchema } = require('./user');
const { extendSchema } = require('../../utils');
const { Parent } = require('./index');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

const InstructorSchema = extendSchema(userSchema, {
	students: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Student'
		}
	],
	school: String
});

// Password hashing (encrypting)
InstructorSchema.pre('save', function(next) {
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
InstructorSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

/**
 * Check whether or not the instructor is an instructor of the student's id passed.
 * @param {String | mongoose.Types.ObjectId} id the id to compare against
 * @returns {Promise<Boolean>} true if the instructor is an instructor of the student of the given id
 */
InstructorSchema.methods.isInstructorOfStudentWithIdOf = function(id) {
	return new Promise((resolve, reject) => {
		if (this.students === null || this.students.length < 1) return resolve(false);
		for (const student of this.students) {
			if (student._id == id) return resolve(true);
		}
		return resolve(false);
	});
};

/**
 * Checks whether or not the instructor given in the `this` context is an instructor that has a student with a parent of the id given
 * @param {String | mongoose.Types.ObjectId} id the id to compare against
 * @returns {Promise<Boolean>} true if the instructor does have a student that has a parent with the id given
 */
InstructorSchema.methods.isInstructorOfChildWithParentIdOf = function(id) {
	return new Promise((resolve, reject) => {
		Parent.findById(id)
			.then((parent) => {
				if (parent === null || parent.children === null || parent.children.length < 1) return resolve(false);
				for (const child of parent.children) {
					if (child.instructors === null || child.instructors.length < 1) continue;
					for (const instructor of child.instructors) {
						if (this._id == instructor._id) return resolve(true);
					}
				}
				return resolve(false);
			})
			.catch((err) => reject(err));
	});
};

/**
 * Gets all the instructors that work in the same school as the instructor given in the `this` context
 * @returns {Promise<Array<Document>>} the co workers or also explained as the instructors who share a school with the instructor given in the `this` context
 */
InstructorSchema.methods.getIntructorCoWorkers = function() {
	return new Promise((resolve, reject) => {
		const coworkers = [];
		this.model()
			.find({ school: this.school })
			.then((coworkerDocs) => {
				coworkerDocs.forEach((coworkerDoc) => {
					if (coworkerDoc._id !== this._id) coworkers.push(coworkerDoc);
				});
			})
			.catch((err) => reject(err));
		return resolve(coworkers);
	});
};

const instructorModel = mongoose.model('Instructor', InstructorSchema, 'instructors');

module.exports = instructorModel;
