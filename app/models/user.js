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

UserSchema.statics.findByName = function (name, cb) {
    this.find({ name: new RegExp(name, 'i') }).sort('name').exec(cb);
};

UserSchema.statics.findByEmail = function (email, cb) {
    this.find({ email: new RegExp(email, 'i') }).sort('name').exec(cb);
};

UserSchema.statics.findAll = function (cb) {
    this.find({ }).sort('order').exec(cb);
};

UserSchema.path('email').index({ unique: true });

UserSchema.pre('save', function (next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    next();
});

exports = module.exports = UserSchema;