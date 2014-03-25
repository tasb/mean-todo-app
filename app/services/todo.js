'use strict';

var mongoose = require('mongoose'),
    util = require('util'),
    PrioritySchema = require('../models/priority.js'),
    TodoListSchema = require('../models/todo-list.js'),
    TodoSchema = require('../models/todo.js');


/**
 * TodoService class implements all services related priorities, todo lists and todos
 * 
 * @param {Object} opts The options for service
 *    @param {Object} opts.log Logger instance
 *    @param {Object} opts.storage Storage config. Where model will be persisted (Mongo Server)
 *      @param {string} opts.storage.host Storage config: hostname
 *      @param {string} opts.storage.port Storage config: port
 *      @param {string} opts.storage.database Storage config: database name
 *      @param {string} opts.storage.user Storage config: user to login on database
 *      @param {string} opts.storage.pass Storage config: pass to login on database
 */
var TodoService = function (opts) {
    var self = this;
    self.cfg = opts || {};
    self.logger = opts.log;
    self.storage = null; // mongoose connection
    self.PriorityModel = null;
    self.TodoListModel = null;
    self.TodoModel = null;

    self.init = function () {
        self.storage = mongoose.createConnection();
        self.storage.open(self.cfg.storage.host, self.cfg.storage.database, self.cfg.storage.port, {
            user: self.cfg.storage.user,
            pass: self.cfg.storage.pass
        });
        self.PriorityModel = self.storage.model('priority', PrioritySchema);
        self.TodoListModel = self.storage.model('todolist', TodoListSchema);
        self.TodoModel = self.storage.model('todo', TodoSchema);
    };

    self.init();
};

TodoService.prototype.newPriority = function (name, order, color, cb) {
    if ('function' === typeof name) {
        cb = name;
        name = null;
    }

    if ('function' === typeof order) {
        cb = order;
        order = null;
    }

    if ('function' === typeof color) {
        cb = color;
        color = null;
    }

    if (('string' !== typeof name) ||
            (name === '')) {
        cb('Invalid parameters: Name is mandatory', null);
        return;
    }

    if (!order || ('number' !== typeof order)) {
        cb('Invalid parameters: Order is mandatory', null);
        return;
    }

    if ('function' !== typeof cb) {
        cb('Invalid parameters: Callback is mandatory', null);
        return;
    }

    var priority = new this.PriorityModel({
        name: name,
        order: order,
        color: color || ''
    });

    priority.save(cb);
};

TodoService.prototype.getPriorities = function (cb) {
    this.PriorityModel.findAll(cb);
};

TodoService.prototype.deletePriority = function (id, cb) {
    this.PriorityModel.remove({
        _id: id
    }, cb);
};

TodoService.prototype.newTodoList = function (userId, name, cb) {
    if ('function' === typeof userId) {
        cb = userId;
        userId = null;
    }

    if ('function' === typeof name) {
        cb = name;
        name = null;
    }

    if (!userId) {
        cb('Invalid parameters: User is mandatory', null);
        return;
    }

    if (('string' !== typeof name) ||
            (name === '')) {
        cb('Invalid parameters: Name is mandatory', null);
        return;
    }

    if ('function' !== typeof cb) {
        cb('Invalid parameters: Callback is mandatory', null);
        return;
    }

    var todolist = new this.TodoListModel({
        user: userId,
        name: name
    });

    todolist.save(cb);
};

TodoService.prototype.getTodoListByUser = function (userid, cb) {
    this.TodoListModel.findByUser({
        _id: userid
    }, cb);
};

TodoService.prototype.deleteTodoList = function (id, cb) {
    this.TodoListModel.remove({
        _id: id
    }, cb);
};

TodoService.prototype.newTodo = function (listId, text, priorityId, dueDate, cb) {
    if ('function' === typeof listId) {
        cb = listId;
        listId = null;
    }

    if ('function' === typeof text) {
        cb = text;
        text = null;
    }

    if ('function' === typeof priorityId) {
        cb = priorityId;
        priorityId = null;
    }

    if ('function' === typeof dueDate) {
        cb = dueDate;
        dueDate = null;
    }

    if (util.isDate(priorityId)) {
        dueDate = priorityId;
        priorityId = null;
    }

    if (!listId) {
        cb('Invalid parameters: List is mandatory', null);
        return;
    }

    if (('string' !== typeof text) ||
            (text === '')) {
        cb('Invalid parameters: Text is mandatory', null);
        return;
    }

    var todo = new this.TodoModel({
        todoList: listId,
        text: text,
        priority: priorityId,
        dueDate: dueDate
    });

    todo.save(cb);
};

TodoService.prototype.getTodosFromList = function (listId, cb) {
    if ('function' === typeof listId) {
        cb = listId;
        listId = null;
    }

    if (!listId) {
        cb('Invalid parameters: List is mandatory', null);
        return;
    }

    this.TodoModel.findByTodoList({
        _id: listId
    }, cb);
};

TodoService.prototype.getTodosFromUser = function (userId, cb) {
    if ('function' === typeof userId) {
        cb = userId;
        userId = null;
    }

    if (!userId) {
        cb('Invalid parameters: User is mandatory', null);
        return;
    }

    this.TodoModel.findByUser({
        _id: userId
    }, cb);
};

TodoService.prototype.updateTodo = function (todo, cb) {
    if ('function' === typeof todo) {
        cb = todo;
        todo = null;
    }

    if (!todo) {
        cb('Invalid parameters: TODO is mandatory', null);
        return;
    }

    todo.save(cb);
};

TodoService.prototype.getTodosFromListNotCompleted = function (listId, cb) {
    if ('function' === typeof listId) {
        cb = listId;
        listId = null;
    }

    if (!listId) {
        cb('Invalid parameters: List is mandatory', null);
        return;
    }

    this.TodoModel.findByTodoListWithOpts({
        _id: listId
    }, {
        completed: false
    }, cb);
};

TodoService.prototype.getTodosFromListCompleted = function (listId, cb) {
    if ('function' === typeof listId) {
        cb = listId;
        listId = null;
    }

    if (!listId) {
        cb('Invalid parameters: List is mandatory', null);
        return;
    }

    this.TodoModel.findByTodoListWithOpts({
        _id: listId
    }, {
        completed: true
    }, cb);
};

TodoService.prototype.deleteTodo = function (id, cb) {
    this.TodoModel.remove({
        _id: id
    }, cb);
};

exports = module.exports = TodoService;