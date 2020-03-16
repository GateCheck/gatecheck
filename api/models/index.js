const instructorModel = require('./instructor');
const parentModel = require('./parent');
const studentModel = require('./student');
const requestModel = require('./request');
const userModel = require('./user');

module.exports = {
    Instructor: instructorModel,
    Parent: parentModel,
    Student: studentModel,
    Request: requestModel,
    User: userModel
}
