import { AuthenticatedRequest, IUser } from '../..';
import { Response } from 'express';
import { User } from '../models';
import validator from 'validator';

export default async (req: AuthenticatedRequest<IUser>, res: Response) => {
	let id = req.params.userId;

	let user = id === undefined || id === null ? req.user : await User.findById(id);

	const { email, phone, loginUsername, password, profilePicture, administrativeLevel, idNumber, fullName } = req.body;

	let allowAccess = user === null || user === undefined ? false : user._id == id || req.user.administrative_level > 1;
	if (!allowAccess) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	} else if (
		(administrativeLevel != null && req.user.administrative_level < 1) ||
		(idNumber != null && req.user.administrative_level < 1) ||
		(fullName != null && req.user.administrative_level < 1)
	) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	}

	if (!validator.isEmail(email)) {
		return res.status(400).json({
			success: false,
			message: 'Invalid email'
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
    
    user?.save().then(doc => {
        res.status(200).json({
            success: true,
            message: 'Updated!',
            updatedUser: user
        })
    });
};
