const mongoose = require('mongoose');
const moment = require('moment');

const requestSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    accepted: Boolean,
    acceptedDate: moment,
    details: String,
    issuedDate: moment,
    issuer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    reason: String,
    title: String,
    type: String,
    validTill: moment,
    goLocation: String,
    backAtSchoolTime: moment
});

const requestModel = mongoose.model('Request', requestSchema, 'requests');

module.exports = requestModel;
