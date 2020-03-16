const { LoginController } = require('./login_controller');

exports.login = (req, res) => {
	const { username, email, password, id } = req.body;

	const loginController = new LoginController({ username, email, id }, password, res);
	loginController.login();
};

exports.delete_user = async (req, res) => {
	const userId = req.params.userId;
	const isStudent = Student.exists({
		_id: userId
	});
	const isParent = Parent.exists({
		_id: userId
	});
	const isInstructor = Instructor.exists({
		_id: userId
	});
	Promise.all(isStudent, isParent, isInstructor)
		.then(([ student, parent, instructor ]) => {
			if (student) {
				Student.findByIdAndDelete(userId)
					.then((doc) => {
						const data = doc.toJSON();
						delete data.password;
						return res.status(204).json({
							success: true,
							message: 'User deleted!',
							user: data
						});
					})
					.catch((err) => {
						console.error(err);
						res.status(500).json({
							success: false,
							error: err
						});
					});
			} else if (parent) {
				Parent.findByIdAndDelete(userId)
					.then((doc) => {
						const data = doc.toJSON();
						delete data.password;
						return res.status(204).json({
							success: true,
							message: 'User deleted!',
							user: data
						});
					})
					.catch((err) => {
						console.error(err);
						res.status(500).json({
							success: false,
							error: err
						});
					});
			} else if (instructor) {
				Instructor.findByIdAndDelete(userId)
					.then((doc) => {
						const data = doc.toJSON();
						delete data.password;
						return res.status(204).json({
							success: true,
							message: 'User deleted!',
							user: data
						});
					})
					.catch((err) => {
						console.error(err);
						res.status(500).json({
							success: false,
							error: err
						});
					});
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({
				sucess: false,
				error: err
			});
		});
};
