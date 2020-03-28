import { Schema, model } from 'mongoose';
import { IReply } from '../..';

const replySchema = new Schema({
	_id: Schema.Types.ObjectId,
	content: String,
	postedDate: Date,
	postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
	parentRequest: {
        type: Schema.Types.ObjectId,
        ref: 'Request'
    }
});

export default model<IReply>('Reply', replySchema, 'replies');
