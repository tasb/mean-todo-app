'use strict';

var mongoose = require('mongoose'),
    _ = require('underscore'),
    Schema = mongoose.Schema;

var TodoSchema = new Schema({
    text: {
        required: true,
        type: String,
        trim: true
    },
    todoList: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'todolist'
    },
    priority: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'priority'
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    dueDate: {
        type: Date
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

TodoSchema.statics.findByText = function (text, cb) {
    this.find({ text: new RegExp(text, 'i') }).populate('priority').sort('text').exec(cb);
};

TodoSchema.statics.findByTodoList = function (todoList, cb) {
    this.find({ todoList: todoList._id }).populate('priority').sort('text').exec(cb);
};

TodoSchema.statics.findByUser = function (user, cb) {
    this.find({ 'todoList.user': user._id }).populate('priority').sort('text').exec(cb);
};

TodoSchema.statics.findByTodoListWithOpts = function (todoList, opts, cb) {
    var criteria = _.extend({ todoList: todoList }, opts);
    this.find(criteria).populate('priority').sort('text').exec(cb);
};

TodoSchema.statics.findByTextOnTodoList = function (text, todoList, cb) {
    this.find({ todoList: todoList._id, text: new RegExp(text, 'i') }).populate('priority').sort('text').exec(cb);
};

TodoSchema.statics.findAll = function (cb) {
    this.find({ }).populate('priority').sort('order').exec(cb);
};

TodoSchema.pre('save', function (next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    next();
});

exports = module.exports = TodoSchema;