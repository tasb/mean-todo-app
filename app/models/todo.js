'use strict';

var mongoose = require('mongoose'),
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

TodoSchema.statics.findByText = function (text, cb) {
    this.find({ text: new RegExp(text, 'i') }).sort('text').exec(cb);
};

TodoSchema.statics.findByTodoList = function (todoList, cb) {
    this.find({ todoList: todoList._id }).sort('text').exec(cb);
};

TodoSchema.statics.findByTextOnTodoList = function (text, todoList, cb) {
    this.find({ todoList: todoList._id, text: new RegExp(text, 'i') }).sort('text').exec(cb);
};

exports = module.exports = TodoSchema;