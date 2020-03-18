import { Schema, Types } from 'mongoose';
import User from './user';
import { IStudent } from '../..';

const StudentSchema: Schema = new Schema(
	{
		instructors: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Instructor'
			}
		],
		parents: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Parent'
			}
		],
		school: String
	},
	{ discriminatorKey: 'kind' }
);

/**
 * Checks whether or not the student in the `this` context has a parent with the id given
 * @param {String} id the id to compare against
 * @returns {Promise<Boolean>} true if the student given in the `this` context has a parent with the id given.
 */
StudentSchema.methods.hasParentWithIdOf = function(this: IStudent, id: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (this.parents === null || this.parents.length < 1) return resolve(false);
		for (const parent of this.parents) {
			if (parent._id == id) return resolve(true);
		}
		return resolve(false);
	});
};

/**
 * Checks whether or not the student in the `this` context has an instructor with the id given
 * @param {String} id the id to compare against
 * @returns {Promise<Boolean>} true if the student given in the `this` context has an instructor with the id given.
 */
StudentSchema.methods.hasInstructorWithIdOf = function(this: IStudent, id: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (this.instructors === null || this.instructors.length < 1) return resolve(false);
		for (const instructor of this.instructors) {
			if (instructor._id == id) return resolve(true);
		}
		return resolve(false);
	});
};

export default User.discriminator<IStudent>('Student', StudentSchema);
