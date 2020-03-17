import express from 'express';
const router = express.Router();

import SettingsController from '../controllers/settings';

import getAuthenticatedUser from '../middleware/get-authenticated-user'; // Ensures the user is logged in. later on used to get what the user is allowed to view and access

router.patch('/:userId', getAuthenticatedUser as any, SettingsController as any);
router.patch('/', getAuthenticatedUser as any, SettingsController as any);

export default router;
