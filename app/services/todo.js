'use strict';

var mongoose = require('mongoose'),
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
    if (('string' !== typeof name) ||
            (name === '')) {
        cb('Invalid parameters: Name is mandatory', null);
        return;
    }

    if (('number' !== typeof order) ||
            (order === '')) {
        cb('Invalid parameters: Order is mandatory', null);
        return;
    }

    if ('function' === typeof color) {
        cb = color;
        color = null;
    }

    if ('function' !== typeof cb) {
        cb('Invalid parameters: Callback is mandatory', null);
        return;
    }

    var priority = new this.PriorityModel({
        name: name,
        order: order,
        color: color
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

exports = module.exports = TodoService;