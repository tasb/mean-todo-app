'use strict';

var mongoose = require('mongoose'),
    validate = require('mongoose-validate'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        validate: [validate.email, 'invalid email address']
    },
    name: {
        required: true,
        type: String,
        trim: true
    },
    password: {
        required: true,
        type: String,
        trim: true,
    },
    salt: {
        required: true,
        type: String,
        trim: true,
    },
    missingPassword: {
        required: true,
        type: Number,
        default: 0
    },
    blocked: {
        required: true,
        type: Boolean,
        default: false
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

UserSchema.statics.findByName = function (name, cb) {
    this.find({ name: new RegExp(name, 'i') }).sort('name').exec(cb);
};

UserSchema.statics.findByEmail = function (name, cb) {
    this.find({ name: new RegExp(name, 'i') }).sort('name').exec(cb);
};

UserSchema.path('email').index({ unique: true });

exports = module.exports = UserSchema;