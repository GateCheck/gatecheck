import { AuthenticatedRequest, IInstructor, IParent, IStudent, UserKind, AdministrativeLevel, IUser } from '../..';
import { Response } from 'express';

import { removeConfidentialData } from '../utils';
import { Instructor, Student } from '../../database/models';

export const get_instructor = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	const instructor =
		req.params.instructorId === undefined && req.user.kind == UserKind.Instructor
			? req.user
			: await Instructor.findById(req.params.instructorId);
	if (instructor === null)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	let allowAccess =
		req.user.administrative_level > AdministrativeLevel.Two || // admin requesting
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
			req.user.administrative_level > AdministrativeLevel.Two || req.userData.userId == req.params.parentId
		)
	});
};

export const get_all_instructors = async (
	req: AuthenticatedRequest<IInstructor & IParent & IStudent>,
	res: Response
) => {
	let instructors: Array<IInstructor> = [];
	if (req.user.administrative_level > AdministrativeLevel.Two) {
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
				req.user.administrative_level > AdministrativeLevel.Two || req.userData.userId == req.params.parentId
			)
		)
	});
};

export const add_students = async (req: AuthenticatedRequest<IUser>, res: Response) => {
	const instructor = await Instructor.findById(req.params.instructorId);

	const allowAccess = req.user.administrative_level > AdministrativeLevel.One;

	if (!allowAccess) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	} else if (instructor == null) {
		return res.status(400).json({
			success: true,
			message: 'Invalid instructor ID'
		});
	}

	const studentToAddIds = [ ...req.query.student ];
	if (studentToAddIds.length < 1) {
		return res.status(200).json({
			success: false,
			message: 'You must pass student IDs and they must be valid!'
		});
	}

	if (instructor.students == null) instructor.students = [];
	for (const studentId of studentToAddIds) {
		const student = await Student.findById(studentId);
		if (student != null) {
			if (!instructor.students.includes(student)) instructor.students.push(student);
			if (student.instructors == null) instructor.students = [];
			if (!student.instructors.includes(instructor)) student.instructors.push(instructor);
			await student.save();
		}
	}

	instructor.save().then((doc) => {
		res.status(200).json({
			success: true,
			message: 'Successfully added children!',
			childrenAdded: doc.students,
			parent: removeConfidentialData(doc, true)
		});
	});
};

export default {
	get_instructor,
	get_all_instructors,
	add_students
};
