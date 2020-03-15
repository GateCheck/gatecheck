const {
    Student,
    Parent,
    Instructor
} = require('./models/index');


const userExists = async (email, username, idNumber) => {
    const studentExists = await Student.exists({ $or: [{ "contact.email": email }, { "username": username }, { "id_number": idNumber }] });
    const parentExists = await Parent.exists({ $or: [{ "contact.email": email }, { "username": username }, { "id_number": idNumber }] });
    const instructorExists = await Instructor.exists({ $or: [{ "contact.email": email }, { "username": username }, { "id_number": idNumber }] });
    return studentExists || parentExists || instructorExists;
}

const getUserById = async (id) => {
    const studentExists = await Student.exists({ _id: id });
    const parentExists = await Parent.exists({ _id: id });
    const instructorExists = await Instructor.exists({ _id: id });
    if (studentExists) return Student.findById(id);
    else if (parentExists) return Parent.findById(id);
    else if (instructorExists) return Instructor.findById(id);
    else throw new Error('Can\'t find user.')
}

const getUserByEmail = async (email) => {
    const studentExists = await Student.exists({ "contact.email": email });
    const parentExists = await Parent.exists({ "contact.email": email });
    const instructorExists = await Instructor.exists({ "contact.email": email });
    if (studentExists) return Student.findOne({ "contact.email": email });
    else if (parentExists) return Parent.findOne({ "contact.email": email });
    else if (instructorExists) return Instructor.findOne({ "contact.email": email });
    else throw new Error('Can\'t find user.')
}

const getUserByRealId = async (id) => {
    const studentExists = await Student.exists({ number_id: id });
    const parentExists = await Parent.exists({ number_id: id });
    const instructorExists = await Instructor.exists({ number_id: id });
    if (studentExists) return Student.findOne({ number_id: id });
    else if (parentExists) return Parent.findOne({ number_id: id });
    else if (instructorExists) return Instructor.findOne({ number_id: id });
    else throw new Error('Can\'t find user.')
}

const getUserByUsername = async (username) => {
    const studentExists = await Student.exists({ username });
    const parentExists = await Parent.exists({ username });
    const instructorExists = await Instructor.exists({ username });
    if (studentExists) return Student.findOne({ username });
    else if (parentExists) return Parent.findOne({ username });
    else if (instructorExists) return Instructor.findOne({ username });
    else throw new Error('Can\'t find user.')
}

module.exports = {
    userExists,
    getUserById,
    getUserByEmail,
    getUserByRealId,
    getUserByUsername
}
