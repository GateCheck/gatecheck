import mongoose from 'mongoose';
import User from './user';
import Parent from './parent';
import { IInstructor } from '../..';

const InstructorSchema = new mongoose.Schema(
	{
		students: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Student'
			}
		],
		school: String
	},
	{ discriminatorKey: 'kind' }
);

/**
 * Check whether or not the instructor is an instructor of the student's id passed.
 * @param {String | mongoose.Types.ObjectId} id the id to compare against
 * @returns {Promise<Boolean>} true if the instructor is an instructor of the student of the given id
 */
InstructorSchema.methods.isInstructorOfStudentWithIdOf = function(id: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (this.students === null || this.students.length < 1) return resolve(false);
		for (const student of this.students) {
			if (student._id == id) return resolve(true);
		}
		return resolve(false);
	});
};

/**
 * Checks whether or not the instructor given in the `this` context is an instructor that has a student with a parent of the id given
 * @param {String | mongoose.Types.ObjectId} id the id to compare against
 * @returns {Promise<Boolean>} true if the instructor does have a student that has a parent with the id given
 */
InstructorSchema.methods.isInstructorOfChildWithParentIdOf = function(id: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		Parent.findById(id)
			.then((parent) => {
				if (parent === null || parent.children === null || parent.children.length < 1) return resolve(false);
				for (const child of parent.children) {
					if (child.instructors === null || child.instructors.length < 1) continue;
					for (const instructor of child.instructors) {
						if (this._id == instructor._id) return resolve(true);
					}
				}
				return resolve(false);
			})
			.catch((err: Error) => reject(err));
	});
};

/**
 * Gets all the instructors that work in the same school as the instructor given in the `this` context
 * @returns {Promise<Array<Document>>} the co workers or also explained as the instructors who share a school with the instructor given in the `this` context
 */
InstructorSchema.methods.findCoworkersByInstructor = function(): Promise<Array<IInstructor>> {
	return new Promise((resolve, reject) => {
		const coworkers: Array<IInstructor> = [];
		this.find({ school: this.school })
			.then((coworkerDocs: Array<IInstructor>) => {
				coworkerDocs.forEach((coworkerDoc: IInstructor) => {
					if (coworkerDoc._id !== this._id) coworkers.push(coworkerDoc);
				});
			})
			.catch((err: Error) => reject(err));
		return resolve(coworkers);
	});
};

export default User.discriminator<IInstructor>('Instructor', InstructorSchema);
