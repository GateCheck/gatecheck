import { AuthenticatedRequest, IInstructor, IParent, IStudent, UserKind, AdministrativeLevel, IUser } from '../..';

import { removeConfidentialData } from '../utils';
import { Response } from 'express';
import { Parent, Student } from '../../database/models';

export const get_parent = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	const parent =
		req.params.parentId === undefined && req.user.kind == UserKind.Parent
			? req.user
			: await Parent.findById(req.params.parentId);
	if (parent === null)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	const isInstructorRequesting = await parent.hasChildWithInstructorOfId(req.userData.userId);
	const allowAccess =
		req.user.administrative_level > AdministrativeLevel.Two || // admin requesting
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
			req.user.administrative_level > AdministrativeLevel.Two ||
				req.userData.userId == req.params.parentId ||
				isInstructorRequesting
		)
	});
};

export const add_children = async (req: AuthenticatedRequest<IUser>, res: Response) => {
	const parent = await Parent.findById(req.params.parentId);

	const allowAccess = req.user.administrative_level > AdministrativeLevel.One;

	if (!allowAccess) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	} else if (parent == null) {
		return res.status(400).json({
			success: true,
			message: 'Invalid parent ID'
		});
	}

	const childrenToAddIds = [ ...req.query.child ];
	if (childrenToAddIds.length < 1) {
		return res.status(200).json({
			success: false,
			message: 'You must pass student IDs and they must be valid!'
		});
	}

	for (const childId of childrenToAddIds) {
		const child = await Student.findById(childId);
		if (child != null) {
			parent.children.push(child);
			child.parents.push(parent);
			await child.save();
		}
	}

	parent.save().then((doc) => {
		res.status(200).json({
			success: true,
			message: 'Successfully added children!',
			childrenAdded: doc.children,
			parent: removeConfidentialData(doc, true)
		});
	});
};

export const add_partners = async (req: AuthenticatedRequest<IUser>, res: Response) => {
	const parent = await Parent.findById(req.params.parentId);

	const allowAccess = req.user.administrative_level > AdministrativeLevel.One;

	if (!allowAccess) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	} else if (parent == null) {
		return res.status(400).json({
			success: true,
			message: 'Invalid parent ID'
		});
	}

	const partnerToAddIds = [ ...req.query.partner ];
	if (partnerToAddIds.length < 1) {
		return res.status(200).json({
			success: false,
			message: 'You must pass student IDs and they must be valid!'
		});
	}

	for (const partnerId of partnerToAddIds) {
		const partner = await Parent.findById(partnerId);
		if (partner != null) {
			parent.partners.push(partner);
			partner.partners.push(parent);
			await partner.save();
		}
	}

	parent.save().then((doc) => {
		res.status(200).json({
			success: true,
			message: 'Successfully added children!',
			childrenAdded: doc.partners,
			parent: removeConfidentialData(doc, true)
		});
	});
};

export const get_all_parents = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	let parents: Array<IParent> = [];
	if (req.user.administrative_level > AdministrativeLevel.Two) {
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
				req.user.administrative_level > AdministrativeLevel.Two || req.userData.userId == req.params.parentId
			)
		)
	});
};

export default {
	get_parent,
	get_all_parents,
	add_children,
	add_partners
};
