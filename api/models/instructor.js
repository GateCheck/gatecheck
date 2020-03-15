const mongoose = require('mongoose'),
    extendSchema = require('mongoose-schema-extend');
const userSchema = require('./user');

const instructorSchema = extendSchema(userSchema, {
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    school: String
})

const instructorModel = mongoose.model('Instructor', instructorSchema, 'instructors');

module.exports = instructorModel;