import mongoose from 'mongoose';
const DB_URI = `mongodb+srv://gatecheck_admin:${process.env
	.MONGODB_ATLAS_PW}@gatecheck-6ixdc.mongodb.net/test?retryWrites=true&w=majority`;

export const connect = () => {
	return new Promise((resolve, reject) => {
		mongoose
			.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
			.then((res) => {
				resolve();
			})
			.catch((err) => reject(err));
	});
};

export const close = () => {
	return mongoose.disconnect();
};

export default { close, connect };
