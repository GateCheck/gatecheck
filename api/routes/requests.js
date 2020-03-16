const express = require('express');
const router = express.Router();

const RequestsController = require('../controllers/requests');

const getAuthenticatedUser = require('../middleware/get-authenticated-user');

router.get("/requests", getAuthenticatedUser, RequestsController.get_all_requests);

router.get("/request/:requestId", getAuthenticatedUser, RequestsController.get_request);

router.post("/request", getAuthenticatedUser, RequestsController.create_request);

router.delete("/request/:requestId", getAuthenticatedUser, RequestsController.delete_request);



module.exports = router;