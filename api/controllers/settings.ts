import { AuthenticatedRequest, IUser, AdministrativeLevel } from '../..';
import { Response } from 'express';
import { User } from '../models';
import validator from 'validator';

export default async (req: AuthenticatedRequest<IUser>, res: Response) => {
	let id = req.params.userId;

	let user = id === undefined || id === null ? req.user : await User.findById(id);

	const { email, phone, loginUsername, password, profilePicture, administrativeLevel, idNumber, fullName } = req.body;
	let allowAccess =
		user === null || user === undefined
			? false
			: id === undefined ||
				id === null ||
				user._id == id ||
				req.user.administrative_level > AdministrativeLevel.One;
	if (!allowAccess) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	} else if (
		(idNumber != null && req.user.administrative_level < AdministrativeLevel.Two) ||
		(fullName != null && req.user.administrative_level < AdministrativeLevel.Two)
	) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	}

	if (password != null && password.length < 8) {
		return res.status(400).json({
			success: false,
			message: 'Invalid password'
		});
	} else if (email != null && !validator.isEmail(email)) {
		return res.status(400).json({
			success: false,
			message: 'Invalid email'
		});
	} else if (await User.exists({ $or: [ { loginUsername }, { 'contact.email': email } ] })) {
		return res.status(200).json({
			success: false,
			message: 'User with this login username or email already exists!'
		});
	} else if (req.user.administrative_level < administrativeLevel) {
		return res.status(200).json({
			success: false,
			message: 'You cannot set an administrative level to higher than your own'
		});
	}
	user!.contact.email = email || user!.contact.email;
	user!.contact.phone = phone || user!.contact.phone;
	user!.loginUsername = loginUsername || user!.loginUsername;
	user!.password = password || user!.password;
	user!.profile_picture = profilePicture || user!.profile_picture;
	user!.administrative_level = administrativeLevel || user!.administrative_level;
	user!.id_number = idNumber || user!.id_number;
	user!.full_name = fullName || user!.full_name;

	user!
		.save()
		.then((doc) => {
			res.status(200).json({
				success: true,
				message: 'Updated!',
				updatedUser: doc
			});
		})
		.catch((err) => {
			res.status(500).json({
				success: false,
				message: err.message
			});
		});
};
