const mongoose = require('mongoose');
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

const requestModel = mongoose.model('Request', requestSchema, 'requests');

module.exports = requestModel;
