const mongoose = require('mongoose');
const { extendSchema } = require('../../utils');
const { UserSchema: userSchema } = require('./user');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

const ParentSchema = extendSchema(userSchema, {
    partners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent'
    }],
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
});

// Password hashing (encrypting)
ParentSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
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
ParentSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

/**
 * Checks whether or not the parent given in the `this` context has a child with the id given.
 * @param {String | mongoose.Types.ObjectId} id the id to compare against
 * @returns {Promise<Boolean>} true if the parent given in the `this` context has a child with the id given
 */
ParentSchema.methods.hasChildWithIdOf = function (id) {
    return new Promise((resolve, reject) => {
        if (this.children === null) return resolve(false);
        for (const child of this.children) {
            if (child._id == id) return resolve(true);
        }
        return resolve(false);
    });
}

/**
 * Checks whether or not the parent given in the `this` context has a child who has an instructor with a given id
 * @param {String | mongoose.Types.ObjectId} id the id to compare against
 * @returns {Promise<Boolean>} true if the parent given in the `this` context has a child who has an instructor with the given id
 */
ParentSchema.methods.hasChildWithInstructorOfId = function (id) {
    return new Promise((resolve, reject) => {
        if (this.children === null) return resolve(false);
        for (const child of this.children) {
            if (child.instructors !== null)
                for (const instructor of child.instructors) {
                    if (instructor._id == id) return resolve(true);
                }
        }
        return resolve(false);
    });
}

/**
 * Gets the instructors of the children of the parent given.
 * @returns {Promise<Array<Document>>} returns the instructors of the children of a parent.
 */
ParentSchema.methods.getChildrenInstructors = function () {
    return new Promise((resolve, reject) => {
        if (this.children === null || this.children.length < 1) return resolve([]);
        const instructors = [];
        for (const child of this.children) {
            if (child.instructors === null || child.instructors.length < 1) continue;
            instructors.push(...child.instructors);
        }
        return resolve(instructors);
    });
}

const parentModel = mongoose.model('Parent', ParentSchema, 'parents');

module.exports = parentModel;