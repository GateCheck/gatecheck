const mongoose = require('mongoose');

const parentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    children: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student'}],
    contact: {
        email: String,
        phone: Number,
    },
    full_name: String,
    id_number: Number,
    partners: [{type: mongoose.Schema.Types.ObjectId, ref: 'Parent'}],
    profile_picture: String,
});

const parentModel = mongoose.model('Parent', parentSchema);

module.exports = parentModel;
