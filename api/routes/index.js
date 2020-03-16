const studentRoutes = require('./students');
const parentRoutes = require('./parents');
const instructorRoutes = require('./instructors');
const requestRoutes = require('./requests');
const authRoutes = require('./auth');

module.exports = {
	studentRoutes,
	parentRoutes,
	instructorRoutes,
	requestRoutes,
	authRoutes
};
