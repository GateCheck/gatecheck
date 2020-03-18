import express from 'express';
const router = express.Router();

import ParentsController from '../controllers/parents';

import getAuthenticatedUser from '../middleware/get-authenticated-user'; // Ensures the user is logged in. later on used to get what the user is allowed to view and access

router.get('/', getAuthenticatedUser as any, ParentsController.get_all_parents as any);

export default router;
