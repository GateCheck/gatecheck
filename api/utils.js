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

module.exports = {
    userExists
}
