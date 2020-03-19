import { sign } from 'jsonwebtoken';
import { removeConfidentialData } from '../../utils';
import { User } from '../../models';
import { IUser, AuthenticatedRequest, AdministrativeLevel, UserKind } from '../../..';
import { Request, Response } from 'express';

/**
 * Verify the user entered a correct password if he didnt, return false if he did, return the token
 * @param {Document} user the user document to be logged into if password is correct
 * @returns {Promise<Boolean> | Promise<null>} if login was not successful will return false otherwise will return the token.
 */
const authenticateAndGetToken = (user: IUser, password: string): Promise<string | null> => {
	return new Promise((resolve, reject) => {
		user.comparePassword(password).then((success) => {
			success
				? resolve(
						sign(
							{
								email: user.contact.email,
								fullName: user.full_name,
								profilePicture: user.profile_picture,
								userId: user._id
							},
							process.env.JWT_KEY!,
							{
								expiresIn: '5h'
							}
						)
					)
				: resolve(null);
		});
	});
};

export const login = async (req: Request, res: Response) => {
	const { loginUsername, password } = req.body;

	const user = await User.findOne({ loginUsername: loginUsername });
	if (user === null) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	}

	const token = await authenticateAndGetToken(user, password);

	token !== null
		? res.status(200).json({
				success: true,
				message: 'Logged in',
				token
			})
		: res.status(401).json({
				success: false,
				message: 'Unauthorized'
			});
};

export const delete_user = async (req: AuthenticatedRequest<IUser>, res: Response) => {
	let allowAccess = req.user.administrative_level > AdministrativeLevel.One || req.user._id == req.params.userId;
	if (!allowAccess)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	const user = await User.findById(req.params.userId);
	if (user === null) {
		return res.status(400).json({
			success: false,
			message: 'Invalid ID'
		});
	}
	user.remove().then((doc) => {
		res.status(200).json({
			success: true,
			message: `User ${user.loginUsername} has been deleted!`,
			deletedUser: removeConfidentialData(doc.toJSON(), true)
		});
	});
};

export const change_user_kind = async (req: AuthenticatedRequest<IUser>, res: Response) => {
	if (req.user.administrative_level < AdministrativeLevel.Two)
		res.status(401).json({
			success: false,
			message: 'Unauthorized'
		});
	const user: IUser & any = await User.findById(req.params.userId);
	if (user === null) {
		return res.status(400).json({
			success: false,
			message: 'Invalid ID'
		});
	}
	if (user.kind.toLowerCase() === req.body.toKind.toLowerCase())
		return res.status(400).json({
			success: false,
			message: 'User is already of type: ' + user.kind
		});

	user.update({ $unset: { students: null }, parents: null, instructors: null });
	const { toKind, instructorIDs, parentsIDs, childrenIDs, partnerIDs, studentIDs, school } = req.body;
	let kindAfter: UserKind; // used to make the type capitalized accurately so search will work.
	switch (toKind.toLowerCase()) {
		case 'student':
			kindAfter = UserKind.Student;
			user['students'] = undefined;
			user['children'] = undefined;
			user['partners'] = undefined;
			user['school'] = school;
			user['instructors'] =
				instructorIDs !== null && instructorIDs !== undefined
					? instructorIDs.map(async (id: string) => await User.findById(id))
					: null;
			user['parents'] =
				parentsIDs !== null && parentsIDs !== undefined
					? parentsIDs.map(async (id: string) => await User.findById(id))
					: null;
			break;
		case 'parent':
			kindAfter = UserKind.Parent;
			user['parents'] = undefined;
			user['instructors'] = undefined;
			user['students'] = undefined;
			user['school'] = undefined;
			user['children'] =
				childrenIDs !== null && childrenIDs !== undefined
					? childrenIDs.map(async (id: string) => await User.findById(id))
					: null;
			user['partners'] =
				partnerIDs !== null && partnerIDs !== undefined
					? partnerIDs.map(async (id: string) => await User.findById(id))
					: null;
			break;
		case 'instructor':
			kindAfter = UserKind.Instructor;
			user['parents'] = undefined;
			user['children'] = undefined;
			user['instructors'] = undefined;
			user['partners'] = undefined;
			user['school'] = school;
			user['students'] =
				studentIDs !== null && studentIDs !== undefined
					? studentIDs.map(async (id: string) => await User.findById(id))
					: null;
			break;
		default:
			return res.status(400).json({
				success: false,
				message: 'Invalid toKind'
			});
	}
	user.save().then((doc: IUser) => {
		doc.collection.updateOne({ _id: user._id }, { $set: { kind: kindAfter } }).then(() => {
			User.findById(doc._id).then((doc2) => {
				return res.status(200).json({
					success: true,
					changedUser: removeConfidentialData(doc2!, true)
				});
			});
		});
	});
};
