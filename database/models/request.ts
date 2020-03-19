import { Schema, model } from 'mongoose';
import { Request } from '../..';

const requestSchema = new Schema({
	_id: Schema.Types.ObjectId,
	status: {
		type: String,
		default: 'Created',
		required: true,
		enum: [ 'Created', 'Denied', 'Accepted' ]
	},
	acceptedDate: Date,
	details: String,
	issuedDate: Date,
	issuer: {
		type: Schema.Types.ObjectId,
		ref: 'Student'
	},
	reason: String,
	title: String,
	validTill: Date,
	goLocation: String,
	backAtSchoolTime: Date
});

export default model<Request>('Request', requestSchema, 'requests');
