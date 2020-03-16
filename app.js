const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');

const { authRoutes, instructorRoutes, parentRoutes, requestRoutes, studentRoutes } = require('./api/routes/');
const app = express();

mongoose.connect(
	`mongodb+srv://gatecheck_admin:${process.env
		.MONGODB_ATLAS_PW}@gatecheck-6ixdc.mongodb.net/test?retryWrites=true&w=majority`,
	{ useNewUrlParser: true, useUnifiedTopology: true }
);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use('/api', instructorRoutes);
app.use('/api', parentRoutes);
app.use('/api', requestRoutes);
app.use('/api', studentRoutes);
app.use('/api', authRoutes);

module.exports = app;
