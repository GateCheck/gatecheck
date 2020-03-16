const mongoose = require('mongoose');
const { UserSchema: userSchema } = require('./user');
const { extendSchema } = require('../../utils');
const { Student } = require('./index');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

const InstructorSchema = extendSchema(userSchema, {
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    school: String
});

InstructorSchema.pre('save', function (next) {
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

InstructorSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

InstructorSchema.statics.isInstructor = function (id) {
    return new Promise((resolve, reject) => {
        resolve(this.exists({ _id: id }));
    });
}

InstructorSchema.methods.isInstructorOfId = function (id) {
    return new Promise((resolve, reject) => {
        if (this.students === null) return resolve(false);
        for (const student of this.students) {
            if (student._id == id) return resolve(true);
        }
        return resolve(false)
    });
}

InstructorSchema.methods.getIntructorCoWorkers = function () {
    return new Promise((resolve, reject) => {
        const coworkers = [];
        this.model().find({ school: this.school }).then(coworkerDocs => {
            coworkerDocs.forEach(coworkerDoc => {
                if (coworkerDoc._id !== this._id) coworkers.push(coworkerDoc);
            });
        }).catch(err => reject(err));
        return resolve(coworkers);
    });
}


const instructorModel = mongoose.model('Instructor', InstructorSchema, 'instructors');

module.exports = instructorModel;