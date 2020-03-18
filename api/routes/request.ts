import express from 'express';
const router = express.Router();

import RequestsController from '../controllers/requests';

import getAuthenticatedUser from '../middleware/get-authenticated-user'; // Ensures the user is logged in. later on used to get what the user is allowed to view and access

router.get('/:requestId', getAuthenticatedUser as any, RequestsController.get_request as any);

router.post('/', getAuthenticatedUser as any, RequestsController.create_request as any);

router.delete('/:requestId', getAuthenticatedUser as any, RequestsController.delete_request as any);

router.patch('/:requestId', getAuthenticatedUser as any, RequestsController.edit_request as any);

router.patch('/:requestId/status', getAuthenticatedUser as any, RequestsController.update_request_status as any);

export default router;
