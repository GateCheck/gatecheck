import { connect } from 'mongoose';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';

import { authRoutes, instructorRoutes, parentRoutes, requestRoutes, studentRoutes, settingsRoute } from './api/routes';

const app = express();

connect(
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
app.use('/api/settings', settingsRoute)

export default app;
