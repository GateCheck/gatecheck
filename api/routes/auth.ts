import express from 'express';
const router = express.Router();

import getAuthenticatedUser from '../middleware/get-authenticated-user'; // Must be an admin to delete an account or the user being deleted. ensures so.

import UserController from '../controllers/user_management';

router.post('/signup', UserController.signup);

router.post('/login', UserController.login);

router.delete('/delete/:userId', getAuthenticatedUser as any, UserController.delete_user as any);

router.patch('/changetype/:userId', getAuthenticatedUser as any, UserController.change_user_kind as any);

export default router;
