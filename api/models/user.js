const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    contact: {
        email: { type: String, required: true, index: { unique: true } },
        phone: Number,
    },
    username: { type: String, index: { unique: true } },
    password: { type: String, required: true },
    full_name: String,
    id_number: { type: Number, index: { unique: true } },
    profile_picture: String,
});



const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    userSchema
};
