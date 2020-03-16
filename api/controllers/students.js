const { Student } = require('../models/index');
const { removeConfidentialData } = require('../utils');

exports.get_student = async (req, res, next) => {
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

exports.get_all_students = async (req, res) => {
	let students = [];

	if (req.user.administrative_level > 2) students = await Student.find();
	else if (req.user.modelName === 'Student') students.push(req.user);
	else if (req.user.modelName === 'Parent' && req.user.children !== null && req.user.children.length > 0)
		students = req.user.children;
	else if (req.user.modelName === 'Instructor' && req.user.students !== null && req.user.students > 0)
		students = req.user.students;

	res.status(200).json({
		success: true,
		students: students.map((student) => removeConfidentialData(student, true))
	});
};
