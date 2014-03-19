'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TodoListSchema = new Schema({
    name: {
        required: true,
        type: String,
        trim: true
    },
    user: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    created: {
        type: Date,
        default: new Date().getTime(),
        required: true
    },
    updated: {
        type: Date,
        default: new Date().getTime(),
        required: true
    }
});

TodoListSchema.statics.findByName = function (name, cb) {
    this.find({ name: new RegExp(name, 'i') }).sort('name').exec(cb);
};

TodoListSchema.statics.findByUser = function (user, cb) {
    this.find({ user: user._id }).sort('name').exec(cb);
};

TodoListSchema.statics.findAll = function (cb) {
    this.find({ }).sort('order').exec(cb);
};

TodoListSchema.index({user: 1, name: 1}, {unique: true});

exports = module.exports = TodoListSchema;