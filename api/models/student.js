const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    contact: {
        email: String,
        phone: Number,
    },
    full_name: String,
    id_number: Number,
    instructors: [{type: mongoose.Schema.Types.ObjectId, ref: 'Instructor'}],
    parents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Parent'}],
    profile_picture: String,
    school: String,
});

const studentModel = mongoose.model('Student', studentSchema);

module.exports = studentModel;
