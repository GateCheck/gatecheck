import express from 'express';
const router = express.Router();

import InstructorsController from '../controllers/instructors';

import getAuthenticatedUser from '../middleware/get-authenticated-user'; // Ensures the user is logged in. later on used to get what the user is allowed to view and access

router.get('/instructors', getAuthenticatedUser as any, InstructorsController.get_all_instructors as any);

router.get('/instructor/:instructorId', getAuthenticatedUser as any, InstructorsController.get_instructor as any);
router.get('/instructor', getAuthenticatedUser as any, InstructorsController.get_instructor as any);

export default router;
