const mongoose = require('mongoose');
const validator = require('validator').default;
const {
    Student,
    Parent,
    Instructor
} = require('../../models/index');


const userExistsInSchema = async (schema, email, username, idNumber) => {
    return schema.exists({
        $or: [
            { "contact.email": email },
            { username: username },
            { id_number: idNumber }
        ]
    });
}

const userExists = async (email, username, idNumber) => {
    const existsAsStudent = await userExistsInSchema(Student, email, username, idNumber);
    const existsAsInstructor = await userExistsInSchema(Instructor, email, username, idNumber);
    const existsAsParent = await userExistsInSchema(Parent, email, username, idNumber);
    return existsAsInstructor || existsAsParent || existsAsStudent;
}

/**
 * Return null if no IDs or map all IDs into documents.
 * @param {String[]} ids the ids to map
 * @param {Model} model mongoose model for querying by id
 */
const nullOrMapDocumentReferences = (ids, model) => {
    if (ids === undefined || ids === null) return null;
    return ids.map(id => model.findById(id));
}

/**
 * build the user model for signup
 * @param {Map} payload 
 * @param {String} type 
 * @param {String[]} instructorIDs 
 * @param {String[]} parentIDs 
 * @param {String[]} studentIDs 
 * @param {String[]} partnerIDs 
 * @param {String[]} childrenIDs 
 * @param {String} school 
 */
const buildModelSignup = (payload, type, instructorIDs, parentIDs, studentIDs, partnerIDs, childrenIDs, school) => {
    if (type === 'student') {
        payload.instructors = nullOrMapDocumentReferences(instructorIDs, Instructor);
        payload.parents = nullOrMapDocumentReferences(parentIDs, Instructor);
        payload.school = school;
        return new Student(payload);
    } else if (type === 'parent') {
        payload.children = nullOrMapDocumentReferences(childrenIDs, Instructor);
        payload.partners = nullOrMapDocumentReferences(partnerIDs, Instructor);
        return new Parent(payload);
    } else if (type === 'instructor') {
        payload.students = nullOrMapDocumentReferences(studentIDs, Instructor);
        payload.school = school;
        return new Instructor(payload);
    }

    throw new Error('Invalid user type: ' + type);
}

const createUser = async (type, data) => {
    const {
        email,
        phone,
        password,
        username,
        fullName,
        idNumber,
        instructorIDs,
        parentIDs,
        partnerIDs,
        studentIDs,
        childrenIDs,
        profilePicture,
        school
    } = data;
    if (password.length < 8) {
        return 'Choose a longer password!';
    } else if (!validator.isEmail(email)) {
        return 'Not a valid email!';
    }

    if (await userExists(email, username, idNumber)) {
        return `User already exists!`;
    }

    const _id = new mongoose.Types.ObjectId();
    const _type = type.toLowerCase();
    const payload = {
        _id,
        contact: {
            email,
            phone
        },
        username,
        password,
        full_name: fullName,
        id_number: idNumber || -1,
        profile_picture: profilePicture
    }

    return buildModelSignup(payload, _type, instructorIDs, parentIDs, studentIDs, partnerIDs, childrenIDs, school);
}



exports.signup = async (req, res) => {
    const signupAs = req.params.signupAs.toLowerCase();

    createUser(signupAs, req.body).then(user => {
        typeof user === typeof '' ? res.status(400).json({ // show the reason the user was not created
            success: false,
            message: user
        }) : user.save().then(userDoc => { // user was created successfully! show user data
            const data = userDoc.toJSON();
            delete data.password;
            res.status(201).json({
                success: true,
                [userDoc.collection.name.slice(0, userDoc.collection.name.length - 1) + 'Created']: data
            });
        });
    }).catch(err => {
        console.error(err);
        res.status(400).json({
            success: false,
            error: err.message
        })
    });
}
