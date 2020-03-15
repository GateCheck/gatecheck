const mongoose = require('mongoose');

const instructorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    contact: {
        email: String,
        phone: Number,
    },
    full_name: String,
    id_number: Number,
    profile_picture: String,
    school: String,
    students: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student'}],
});

const instructorModel = mongoose.model('Instructor', instructorSchema);

module.exports = instructorModel;
