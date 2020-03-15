const mongoose = require('mongoose');
const moment = require('moment');
const { Student } = require('../models/index');

const requestSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    accepted: Boolean,
    acceptedDate: Date,
    details: String,
    issuedDate: Date,
    issuer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    reason: String,
    title: String,
    validTill: Date,
    goLocation: String,
    backAtSchoolTime: Date
});

requestSchema.statics.findByRequestIssuerId = (id, callback) => {
    const query = this.find();

    Student.findOne({ _id: id }).then(student => {
        query.where({ issuer: student._id }).exec(callback);
    });
    return query;

}

const requestModel = mongoose.model('Request', requestSchema, 'requests');

module.exports = requestModel;
