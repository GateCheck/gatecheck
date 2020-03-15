const mongoose = require('mongoose');
const { extendSchema } = require('../../utils');
const { userSchema } = require('./user');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

const parentSchema = extendSchema(userSchema, {
    partners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent'
    }],
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
});

parentSchema.pre('save', function(next) {
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

parentSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


const parentModel = mongoose.model('Parent', parentSchema, 'parents');

module.exports = parentModel;