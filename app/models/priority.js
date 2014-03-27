'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PrioritySchema = new Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        match: /^([\w]{1,100})$/
    },
    order: {
        required: true,
        type: Number,
        min: 1
    },
    color: {
        type: String,
        trim: true,
        match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
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

PrioritySchema.statics.findByName = function (name, cb) {
    this.find({ name: new RegExp(name, 'i') }).sort('order').exec(cb);
};

PrioritySchema.statics.findAll = function (cb) {
    this.find({ }).sort('order').exec(cb);
};

PrioritySchema.statics.cleanUp = function () {
    this.remove({}).exec();
};

PrioritySchema.path('name').index({ unique: true });
PrioritySchema.path('order').index({ unique: true });

PrioritySchema.pre('save', function (next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    next();
});

exports = module.exports = PrioritySchema;