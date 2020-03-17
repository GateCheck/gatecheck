import { AuthenticatedRequest, IInstructor, IParent, IStudent } from '../..';
import { Response } from 'express';

import moment from 'moment';
import { Types } from 'mongoose';
import { Request } from '../models';

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
				req.user.administrative_level > 2 ||
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

export const create_request = async (req: AuthenticatedRequest<IInstructor & IParent & IStudent>, res: Response) => {
	const { details, reason, title, goLocation } = req.body;

	const request = new Request({
		_id: new Types.ObjectId(),
		accepted: false,
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

	if (req.user.administrative_level > 2 || request.issuer._id === req.user._id) {
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

	if (req.user.administrative_level > 2)
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

export default { get_all_requests, get_request, delete_request, create_request };
