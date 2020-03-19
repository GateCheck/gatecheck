import mongoose from 'mongoose';
import validator from 'validator';
import { sign } from 'jsonwebtoken';
import { IUser, IStudent, RegisterUserPayload } from '../../..';
import { Request, Response } from 'express';
import { User, Student } from '../../../database/models';


const createUser = async ({
	loginUsername,
	phone,
	password,
	fullName,
	idNumber,
	instructorIDs,
	parentIDs,
	profilePicture,
	school
}: RegisterUserPayload<IStudent>): Promise<IStudent | string> => {
	if (password == null || password.length < 8) {
		return 'Choose a stronger password!';
	} else if (loginUsername == null || !validator.isEmail(loginUsername)) {
		return 'Not a valid email!';
	}

	const userExists = await User.exists({ $or: [{ loginUsername }] });

	if (userExists) {
		return `User already exists!`;
	}

	const _id = new mongoose.Types.ObjectId();
	const payload = {
		_id,
		contact: {
			email: loginUsername,
			phone: phone || -1
		},
		loginUsername,
		password,
		full_name: fullName || null,
		id_number: idNumber || null,
		profile_picture: profilePicture || null,
		administrative_level: 1,
		school: school || null,
		instructors:
			instructorIDs !== null && instructorIDs !== undefined
				? instructorIDs.map(async (id: string) => await User.findById(id))
				: null,
		parents:
			parentIDs !== null && parentIDs !== undefined
				? parentIDs.map(async (id: string) => await User.findById(id))
				: null
	};
	return new Student(payload);
};

export const signup = async (req: Request, res: Response) => {
	let user: IUser | string;
	try {
		user = await createUser(req.body);
	} catch (err) {
		console.error(err);
		return res.status(400).json({
			success: false,
			error: err.message
		});
	}

	if (typeof user === "string") {
		return res.status(400).json({
			// show the reason the user was not created
			success: false,
			message: user
		});
	}

	user
		.save()
		.then((userDoc) => {
			// user was created successfully! show user data
			const token = sign(
				{
					email: userDoc.contact.email,
					fullName: userDoc.full_name,
					profilePicture: userDoc.profile_picture,
					userId: userDoc._id
				},
				process.env.JWT_KEY!,
				{
					expiresIn: '5h'
				}
			);
			const data = userDoc.toJSON();
			delete data.password;
			res.status(201).json({
				success: true,
				token,
				[userDoc.collection.name.slice(0, userDoc.collection.name.length - 1) + 'Created']: data
			});
		})
		.catch((err: Error) => {
			console.error(err);
			res.status(401).json({
				success: false,
				message: 'Unauthorized'
			});
		});
};
