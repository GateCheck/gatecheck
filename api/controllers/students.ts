import { Student } from '../models';
import { removeConfidentialData } from '../utils';
import { AuthenticatedRequest, IStudent, IInstructor, IParent } from '../..';
import { Response } from 'express';

export const get_student = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	const student = await Student.findById(req.params.studentId);
	if (student === null)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});

	const allowAccess =
		req.user.administrative_level > 2 ||
		student._id == req.user._id ||
		student.hasParentWithIdOf(req.user._id) ||
		student.hasInstructorWithIdOf(req.user._id);

	if (!allowAccess)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	return res.status(200).json({
		success: true,
		message: "Obtained student's data",
		student: removeConfidentialData(student, true)
	});
};

export const get_all_students = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	let students: Array<IStudent> = [];

	if (req.user.administrative_level > 2) students = await Student.find();
	else if (req.user.kind === 'Student') students.push(req.user);
	else if (req.user.kind === 'Parent' && req.user.children != null && req.user.children.length > 0)
		students = req.user.children;
	else if (req.user.kind === 'Instructor' && req.user.students != null && req.user.students.length > 0)
		students = req.user.students;

	res.status(200).json({
		success: true,
		students: students.map((student) => removeConfidentialData(student, true))
	});
};

export default { get_all_students, get_student };
