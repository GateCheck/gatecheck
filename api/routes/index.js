const { studentRoute, studentsRoute } = require('./student_routes/index'); 
const { requestRoute, requestsRoute } = require('./request_routes/index'); 
const auth = require('./auth/auth');

module.exports = {
    studentRoutes: {
        studentRoute,
        studentsRoute
    },
    parentRotues: {

    },
    instructorRoutes: {

    },
    requestRoutes: {
        requestRoute,
        requestsRoute
    },
    auth
}
