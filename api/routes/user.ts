import express, { Response } from 'express';
const router = express.Router();

import getAuthenticatedUser from '../middleware/get-authenticated-user'; // Must be an admin to delete an account or the user being deleted. ensures so.

import UserController from '../controllers/user_management';
import { AuthenticatedRequest, IUser } from '../..';
import { removeConfidentialData } from '../utils';

router.get(
	'/',
	getAuthenticatedUser as any,
	((req: AuthenticatedRequest<IUser>, res: Response) => {
		res.status(200).json({
			sucess: true,
			user: removeConfidentialData(req.user, true)
		});
	}) as any
);

router.post('/signup', UserController.signup);

router.post('/login', UserController.login);

router.delete('/delete/:userId', getAuthenticatedUser as any, UserController.delete_user as any);

router.patch('/changekind/:userId', getAuthenticatedUser as any, UserController.change_user_kind as any);

export default router;
