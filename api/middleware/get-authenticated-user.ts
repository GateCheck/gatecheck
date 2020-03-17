import { verify } from 'jsonwebtoken';
import { User } from '../models';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, IUser } from '../..';

export default (req: AuthenticatedRequest<IUser>, res: Response, next: NextFunction) => {
	try {
		const decoded = verify(req.headers.authorization!.split(' ')[1], process.env.JWT_KEY!);
		req.userData = decoded as AuthenticatedRequest<IUser>['userData'];
		User.findById(req.userData.userId)
			.then((user) => {
				if (user === null) {
					return res.status(401).json({
						message: 'Auth failed'
					});
				}
				req.user = user;
				next();
			})
			.catch((err) => {
				return res.status(401).json({
					message: 'Auth failed'
				});
			});
	} catch (err) {
		return res.status(401).json({
			message: 'Auth failed'
		});
	}
};
