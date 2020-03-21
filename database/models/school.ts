import { Schema, model } from 'mongoose';
import { School } from '../..';

const schoolSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: String
});

export default model<School>('School', schoolSchema, 'schools');
