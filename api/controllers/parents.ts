import { AuthenticatedRequest, IInstructor, IParent, IStudent } from '../..';

import { Parent } from '../models';
import { removeConfidentialData } from '../utils';
import { Response } from 'express';

export const get_parent = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	const parent = await Parent.findById(req.params.parentId);
	if (parent === null)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	const isInstructorRequesting = await parent.hasChildWithInstructorOfId(req.userData.userId);
	const allowAccess =
		req.user.administrative_level > 2 || // admin requesting
		req.userData.userId == req.params.parentId || // same user requesting
		(await parent.hasChildWithIdOf(req.userData.userId)) || // child of parent requesting
		isInstructorRequesting; // instructor of a child of the parent requesting
	if (!allowAccess)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	return res.status(200).json({
		success: true,
		message: "Obtained parent's data",
		parent: removeConfidentialData(
			parent,
			req.user.administrative_level > 2 || req.userData.userId == req.params.parentId || isInstructorRequesting
		)
	});
};

export const get_all_parents = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	let parents: Array<IParent> = [];
	if (req.user.administrative_level > 2) {
		Parent.find().then((parentDocs) => {
			if (parentDocs !== null && parentDocs.length !== 0) parents = parentDocs;
		});
	} else if (req.user.kind === 'Instructor' && req.user.students !== null && req.user.parents.length !== 0)
		req.user.students.forEach((student) => {
			parents.push(...student.parents);
		});
	else if (req.user.kind === 'Parent' && req.user.partners !== null && req.user.parents.length !== 0) {
		parents = req.user.partners;
		parents.push(req.user);
	} else if (req.user.kind === 'Student' && req.user.parents !== null && req.user.parents.length !== 0)
		parents = req.user.parents;
	else if (req.user.kind === 'Parent') parents.push(req.user);

	res.status(200).json({
		success: true,
		parents: parents.map((parent) =>
			removeConfidentialData(
				parent,
				req.user.administrative_level > 2 || req.userData.userId == req.params.parentId
			)
		)
	});
};

export default {
	get_parent,
	get_all_parents
};
