import { Schema, Types } from 'mongoose';
import User from './user';
import { IInstructor, IParent } from '../..';

const ParentSchema = new Schema(
	{
		partners: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Parent'
			}
		],
		children: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Student'
			}
		]
	},
	{ discriminatorKey: 'kind' }
);

/**
 * Checks whether or not the parent given in the `this` context has a child with the id given.
 * @param {String | mongoose.Types.ObjectId} id the id to compare against
 * @returns {Promise<Boolean>} true if the parent given in the `this` context has a child with the id given
 */
ParentSchema.methods.hasChildWithIdOf = function(this: IParent, id: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (this.children === null) return resolve(false);
		for (const child of this.children) {
			if (child._id == id) return resolve(true);
		}
		return resolve(false);
	});
};

/**
 * Checks whether or not the parent given in the `this` context has a child who has an instructor with a given id
 * @param {String | mongoose.Types.ObjectId} id the id to compare against
 * @returns {Promise<Boolean>} true if the parent given in the `this` context has a child who has an instructor with the given id
 */
ParentSchema.methods.hasChildWithInstructorOfId = function(this: IParent, id: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (this.children === null) return resolve(false);
		for (const child of this.children) {
			if (child.instructors !== null)
				for (const instructor of child.instructors) {
					if (instructor._id == id) return resolve(true);
				}
		}
		return resolve(false);
	});
};

/**
 * Gets the instructors of the children of the parent given.
 * @returns {Promise<Array<IInstructor>>} returns the instructors of the children of a parent.
 */
ParentSchema.methods.getChildrenInstructors = function(this: IParent): Promise<Array<IInstructor>> {
	return new Promise((resolve, reject) => {
		if (this.children === null || this.children.length < 1) return resolve([]);
		const instructors = [];
		for (const child of this.children) {
			if (child.instructors === null || child.instructors.length < 1) continue;
			instructors.push(...child.instructors);
		}
		return resolve(instructors);
	});
};

export default User.discriminator<IParent>('Parent', ParentSchema);
