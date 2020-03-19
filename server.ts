import { createServer } from 'http';
import { connect } from './database';
import app from './app';

const server = createServer(app);

connect().then(() => {
	server.listen(process.env.PORT || 3000, () => {
		console.log(`Started listening on port ${process.env.PORT || 3000}`);
	});
});
