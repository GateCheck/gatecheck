const mongoose = require('mongoose');

const extendSchema = (Schema, obj) => (
    new mongoose.Schema(
        Object.assign({}, Schema.obj, obj)
    )
);

module.exports = {
    extendSchema,
}
