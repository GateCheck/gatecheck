import express from 'express';
import { School } from '../../database/models';
const router = express.Router();

router.get('/', (req, res) => {
	School.find({})
		.then((schools) => {
			res.status(200).json({
				success: true,
				schools
			});
		})
		.catch((err) => {
			res.status(500).json({
				success: false,
				message: err.message
			});
		});
});

export default router;
