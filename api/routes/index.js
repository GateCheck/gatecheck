const studentRoutes = require('./students');
const parentRoutes = require('./parents');
const instructorRoutes = require('./instructors');
const requestRoutes = require('./requests');
const auth = require('./auth');

module.exports = {
    studentRoutes,
    parentRoutes,
    instructorRoutes,
    requestRoutes,
    auth
}
