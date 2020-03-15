const mongoose = require('mongoose'),
    extendSchema = require('mongoose-schema-extend');
const userSchema = require('./user');

const studentSchema = extendSchema(userSchema, {
    instructors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor'
    }],
    parents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent'
    }],
    school: String
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;