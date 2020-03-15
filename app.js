const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');

const { studentRoutes, auth, requestRoutes } = require('./api/routes/index');
const app = express();


mongoose.connect(`mongodb+srv://gatecheck_admin:${process.env.MONGODB_ATLAS_PW}@gatecheck-6ixdc.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use('/api', studentRoutes.studentRoute);
app.use('/api', studentRoutes.studentsRoute);
app.use('/api', requestRoutes.requestRoute);
app.use('/api', requestRoutes.requestsRoute);
app.use('/api/auth', auth);



module.exports = app;
