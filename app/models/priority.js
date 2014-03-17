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
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated: {
        type: Date,
        default: Date.now,
        required: true
    }
});

exports = module.exports = PrioritySchema;