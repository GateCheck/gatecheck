import {
	AuthenticatedRequest,
	IInstructor,
	IParent,
	IStudent,
	AdministrativeLevel,
	UserKind,
	RequestStatus
} from '../..';
import { Response } from 'express';

import moment from 'moment';
import { Types } from 'mongoose';
import { Request, User } from '../models';

export const get_request = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	Request.findById(req.params.requestId)
		.then(async (request) => {
			if (request === null) {
				return res.status(401).json({
					success: false,
					message: 'Unauthorized' // for security reasons as to not let users brute force to get all document ids
				});
			}

			// find if access should be allowed to the user. if the user is an instructor check if he is an instructor of the student who made the request if not set to false
			// otherwise if user is the maker of the request set true
			let accessAllowed =
				req.user.administrative_level > AdministrativeLevel.Two ||
				(req.user.kind === 'Instructor'
					? await req.user.isInstructorOfStudentWithIdOf(request.issuer._id)
					: request.issuer._id == req.userData.userId);

			if (accessAllowed) {
				res.status(200).json({
					success: true,
					message: 'Found resource',
					request
				});
			} else {
				res.status(401).json({
					success: false,
					message: 'Unauthorized'
				});
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({
				success: false,
				message: err.message,
				error: err
			});
		});
};

export const edit_request = async (req: AuthenticatedRequest<IStudent>, res: Response) => {
	const request = await Request.findById(req.params.requestId);
	if (request == null) {
		return res.status(400).json({
			success: false,
			message: "Can't find request"
		});
	}
	const { details, reason, title, goLocation } = req.body;

	const allowAccess = req.user.administrative_level > AdministrativeLevel.Two || req.user._id === request.issuer._id;

	if (!allowAccess) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	} else if (request.status === RequestStatus.Accepted) {
		return res.status(400).json({
			success: false,
			message: 'This request is in an immutable state as it has been accepted.'
		});
	}

	request.details = details || request.details;
	request.reason = reason || request.reason;
	request.title = title || request.title;
	request.goLocation = goLocation || request.goLocation;

	request.save().then((doc) => {
		res.status(200).json({
			success: true,
			request: doc
		});
	});
};

export const update_request_status = async (req: AuthenticatedRequest<IInstructor>, res: Response) => {
	if (
		req.body.status == null ||
		req.body.status.toLowerCase() !== RequestStatus.Accepted.toLowerCase() ||
		req.body.status.toLowerCase() !== RequestStatus.Denied.toLowerCase()
	) {
		return res.status(400).json({
			success: false,
			message: 'Invalid request body. Must pass `status` which could be `Accepted` or `Denied`'
		});
	}
	const request = await Request.findById(req.params.requestId);
	if (request == null) {
		return res.status(400).json({
			success: false,
			message: "Can't find request"
		});
	}

	const allowAccess =
		req.user.administrative_level > AdministrativeLevel.Two ||
		(req.user.kind == UserKind.Instructor && (await req.user.isInstructorOfStudentWithIdOf(request.issuer._id)));

	if (!allowAccess) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	} else if (request.status === RequestStatus.Accepted) {
		return res.status(400).json({
			success: false,
			message: 'This request is in an immutable state as it has been accepted.'
		});
	}

	request.status = req.body.status.toLowerCase() === RequestStatus.Accepted.toLowerCase() ? RequestStatus.Accepted : RequestStatus.Denied;
	request.acceptedDate = moment().unix();

	request.save().then((doc) => {
		res.status(200).json({
			success: true,
			request: doc
		});
	});
};

export const create_request = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	const { details, reason, title, goLocation } = req.body;

	const request = new Request({
		_id: new Types.ObjectId(),
		status: RequestStatus.Created,
		acceptedDate: null,
		details,
		issuedDate: moment().unix(),
		issuer: req.user,
		reason,
		title,
		validTill: moment().unix() + 24 * 60 * 60,
		goLocation,
		backAtSchoolTime: null
	});

	request
		.save()
		.then((doc) => {
			res.status(201).json({
				success: true,
				message: 'Created request!',
				request: doc.toJSON()
			});
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Failed to save resource',
				error: err
			});
		});
};

export const delete_request = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	const request = await Request.findById(req.params.requestId);
	if (request === null) {
		return res.status(404).json({
			success: false,
			message: 'Invalid resource ID'
		});
	}

	if (req.user.administrative_level > AdministrativeLevel.Two || request.issuer._id === req.user._id) {
		Request.deleteOne({
			_id: request._id
		}).then(() => {
			res.status(200).json({
				success: true,
				message: 'Deleted resource',
				request
			});
		});
	} else {
		res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	}
};

export const get_all_requests = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	const query = Request.find();

	if (req.user.administrative_level > AdministrativeLevel.Two)
		query.then((requestDocs) => {
			res.status(200).json({
				success: true,
				message: 'Requests made by: ' + req.userData.fullName,
				requests: requestDocs.map((requestDoc) => requestDoc.toJSON())
			});
		});
	else
		query.where({ issuer: req.user._id }).then((requestDocs) => {
			res.status(200).json({
				success: true,
				message: 'Requests made by: ' + req.userData.fullName,
				requests: requestDocs.map((requestDoc) => requestDoc.toJSON())
			});
		});
};

export default { get_all_requests, get_request, delete_request, create_request, edit_request, update_request_status };
