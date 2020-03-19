import { Schema, model } from 'mongoose';
import { genSalt, hash as _hash, compare } from 'bcryptjs';
import { IUser } from '../..';

const SALT_WORK_FACTOR = 10;

const options = { discriminatorKey: 'kind' };

/**
 * Base schema, later on extened upon to reduce amount of code and increase simplicity.
 * administrative_level is the user access level. what a user can access and view.
 */
const UserSchema: Schema = new Schema(
	{
		_id: Schema.Types.ObjectId,
		contact: {
			email: { type: String, required: true, index: { unique: true } },
			phone: { type: Number, default: -1, required: false }
		},
		loginUsername: { type: String, required: true, index: { unique: true } },
		password: { type: String, required: true },
		full_name: { type: String, default: null, required: false },
		id_number: { type: Number, default: null, required: false },
		profile_picture: { type: String, default: null, required: false },
		administrative_level: { type: Number, default: 1, enum: [ 1, 2, 3 ], required: false }
	},
	options
);

// Password hashing (encrypting)
UserSchema.pre('save', function(next: Function) {
	const user = this as IUser;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		// hash the password using our new salt
		_hash(user.password, salt, function(err, hash) {
			if (err) return next(err);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

/**
 * Compare the password of a user to the password passed
 * @param {String} candidatePassword the password compared to the hash
 * @param {Function} cb the function called when finishing comparasion. first argument is if an error occurred second is if password is correct or not
 * @returns {Promise<Boolean>}
 */
UserSchema.methods.comparePassword = function(candidatePassword: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		compare(candidatePassword, this.password, (err: Error, isMatch: boolean) => {
			if (err) return resolve(false);
			resolve(isMatch);
		});
	});
};

export default model<IUser>('User', UserSchema, 'users');

