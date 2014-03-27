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
    created_at: {
        type: Date,
        default: new Date().getTime(),
        required: true
    },
    updated_at: {
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

TodoListSchema.pre('save', function (next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    next();
});

exports = module.exports = TodoListSchema;