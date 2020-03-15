const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

const studentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    contact: {
        email: { type: String, required: true, index: { unique: true } },
        phone: Number,
    },
    username: { type: String, index: { unique: true } },
    password: { type: String, required: true },
    full_name: String,
    id_number: Number,
    instructors: [{type: mongoose.Schema.Types.ObjectId, ref: 'Instructor'}],
    parents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Parent'}],
    profile_picture: String,
    school: String,
});

studentSchema.pre('save', function(next) {
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

studentSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;
