import express from 'express';
const router = express.Router();

import StudentsController from '../controllers/students';

import getAuthenticatedUser from '../middleware/get-authenticated-user'; // Ensures the user is logged in. later on used to get what the user is allowed to view and access

router.get('/:studentId', getAuthenticatedUser as any, StudentsController.get_student as any);
router.get('/', getAuthenticatedUser as any, StudentsController.get_student as any);

export default router;
