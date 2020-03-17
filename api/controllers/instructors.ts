import { AuthenticatedRequest, IInstructor, IParent, IStudent } from '../..';
import { Response } from 'express';

import { Instructor } from '../models';
import { removeConfidentialData } from '../utils';

export const get_instructor = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	const instructor = await Instructor.findById(req.params.instructorId);
	if (instructor === null)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	let allowAccess =
		req.user.administrative_level > 2 || // admin requesting
		req.userData.userId == req.params.instructorId || // same user requesting
		instructor.isInstructorOfStudentWithIdOf(req.user._id) || // student of instructor requesting
		instructor.isInstructorOfChildWithParentIdOf(req.user._id); // parent requesting
	if (!allowAccess)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	return res.status(200).json({
		success: true,
		message: "Obtained instructor's data",
		instructor: removeConfidentialData(
			instructor,
			req.user.administrative_level > 2 || req.userData.userId == req.params.parentId
		)
	});
};

export const get_all_instructors = async (
	req: AuthenticatedRequest<IInstructor & IParent & IStudent>,
	res: Response
) => {
	let instructors: Array<IInstructor> = [];
	if (req.user.administrative_level > 2) {
		Instructor.find().then((instructorDocs) => {
			if (instructorDocs !== null && instructorDocs.length !== 0)
				instructorDocs.forEach((instructorDoc) => instructors.push(instructorDoc));
		});
	} else if (req.user.kind === 'Instructor') {
		instructors = await req.user.findCoworkersByInstructor();
		instructors.push(req.user);
	} else if (req.user.kind === 'Parent' && req.user.children !== null && req.user.children.length > 0) {
		instructors = await req.user.getChildrenInstructors();
	} else if (req.user.kind === 'Student' && req.user.instructors !== null && req.user.instructors.length > 0) {
		instructors = req.user.instructors;
	}

	res.status(200).json({
		success: true,
		message: 'Instructors relating to user: ' + req.userData.email,
		instructors: instructors.map((instructor) =>
			removeConfidentialData(
				instructor,
				req.user.administrative_level > 2 || req.userData.userId == req.params.parentId
			)
		)
	});
};

export default {
	get_instructor,
	get_all_instructors
};
