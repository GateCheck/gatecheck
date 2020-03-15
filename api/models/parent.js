const mongoose = require('mongoose'),
    extendSchema = require('mongoose-schema-extend');
const userSchema = require('./user');

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