const mongoose = require('mongoose');

/**
 * extend a schema
 * @param {mongoose.Schema} Schema the schema that will be taken and extended from
 * @param {Map} obj the extended functionality
 */
const extendSchema = (Schema, obj) => new mongoose.Schema(Object.assign({}, Schema.obj, obj));

module.exports = {
	extendSchema
};
