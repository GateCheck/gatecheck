const mongoose = require('mongoose');
const { extendSchema } = require('../../utils');
const { userSchema } = require('./user');

const parentSchema = extendSchema(userSchema, {
    partners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent'
    }],
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
});


const parentModel = mongoose.model('Parent', parentSchema, 'parents');

module.exports = parentModel;