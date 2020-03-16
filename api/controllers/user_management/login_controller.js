const jwt = require('jsonwebtoken');

class LoginController {
	constructor(authEmailOrUsernameOrID, password, response) {
		this.password = password;
		(this.username = authEmailOrUsernameOrID.username),
			(this.email = authEmailOrUsernameOrID.email),
			(this.id = authEmailOrUsernameOrID.id);
		this.res = response;
	}

	loginWithEmail() {
		if (this.password === undefined) this.invalidAuth();
		getUserByEmail(this.email)
			.then(async (user) => {
				if (!await this._login(user)) this.invalidAuth();
				this.auth(user);
			})
			.catch((err) => this.error(err));
	}

	loginWithUsername() {
		if (this.password === undefined) this.invalidAuth();
		getUserByUsername(this.username)
			.then(async (user) => {
				if (!await this._login(user)) this.invalidAuth();
				this.auth(user);
			})
			.catch((err) => this.error(err));
	}

	loginWithID() {
		if (this.password === undefined) this.invalidAuth();
		getUserByRealId(this.id)
			.then(async (user) => {
				if (!await this._login(user)) this.invalidAuth();
				this.auth(user);
			})
			.catch((err) => this.error(err));
	}

	login() {
		if (this.email !== undefined) this.loginWithEmail();
		else if (this.username !== undefined) this.loginWithUsername();
		else if (this.id !== undefined) this.loginWithID();
	}

	error(error) {
		console.error(error);
		this.res.status(500).json({
			success: false,
			error: error.message
		});
	}

	auth(user) {
		const token = jwt.sign(
			{
				email: user.contact.email,
				fullName: user.full_name,
				school: user.school,
				profilePicture: user.profile_picture,
				userId: user._id
			},
			process.env.JWT_KEY,
			{
				expiresIn: '5h'
			}
		);

		this.res.status(200).json({
			success: true,
			message: 'Auth successful',
			token
		});
	}

	invalidAuth() {
		res.status(401).json({
			message: 'Auth failed'
		});
	}

	_login(user) {
		if (user === null) {
			return Promise.resolve(false);
		}
		return new Promise((resolve, reject) => {
			user.comparePassword(this.password, (err, success) => {
				if (err) {
					return resolve(false);
				}
				resolve(success);
			});
		});
	}
}

module.exports = LoginController;
