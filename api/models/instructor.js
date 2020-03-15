const mongoose = require('mongoose');
const { userSchema } = require('./user');
const { extendSchema } = require('../../utils');

const instructorSchema = extendSchema(userSchema, {
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    school: String
});

const instructorModel = mongoose.model('Instructor', instructorSchema, 'instructors');

module.exports = instructorModel;