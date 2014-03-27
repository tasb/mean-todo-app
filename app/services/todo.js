'use strict';

var mongoose = require('mongoose'),
    util = require('util'),
    _ = require('underscore'),
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

/**
 * This callback type is called `successCallback` and is displayed as a global symbol.
 *
 * @callback successCallback
 * @param {string} err - error message when an error occurs
 * @param {boolean} success - indicates if the operation runs with success
 */

 /**
 * This callback type is called `objectCallback` and is displayed as a global symbol.
 *
 * @callback objectCallback
 * @param {string} err - error message when an error occurs
 * @param {string} obj - model object that was created or modified
 */

 /**
 * This callback type is called `listCallback` and is displayed as a global symbol.
 *
 * @callback listCallback
 * @param {string} err - error message when an error occurs
 * @param {string} list - list of model objects
 */

/**
 * Creates new priority
 * 
 * @param {string} name Priority name
 * @param {Number} order Priority order 
 * @param {string} color Color to identify priority (rgb format: #XXXXXX)
 * @param {objectCallback} cb Return callback
 */
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

/**
 * Gets all priorities
 * 
 * @param {listCallback} cb Return callback
 */
TodoService.prototype.getPriorities = function (cb) {
    this.PriorityModel.findAll(cb);
};

/**
 * Delets a priority record
 *
 * @param {ObjectId} id Priority Id
 * @param {succesCallback} cb Return callback
 */
TodoService.prototype.deletePriority = function (id, cb) {
    this.PriorityModel.remove({
        _id: id
    }, cb);
};


/**
 * Creates a new TODO List
 * 
 * @param {ObjectId} userId User id to whom TODO list will be added
 * @param {string} name TODO List name
 * @param {objectCallback} cb Return callback
 */
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

/**
 * Gets a TODO List details
 * 
 * @param {ObjectId} listId TODO list Id
 * @param {objectCallback} cb Return callback
 */
TodoService.prototype.getTodoListById = function (listId, cb) {
    this.logger.info('[Todo Service] getTodoListById. Id: %s', listId);

    if (!listId) {
        cb('Invalid parameters: ListId is mandatory', null);
        return;
    }

    if ('function' !== typeof cb) {
        cb('Invalid parameters: Callback is mandatory', null);
        return;
    }

    this.TodoListModel.findById(listId, cb);
};

/**
 * Gets all TODO Lists from an user
 * 
 * @param {ObjectId} userid User Id
 * @param {listCallback} cb Return callback
 */
TodoService.prototype.getTodoListByUser = function (userid, cb) {
    this.TodoListModel.findByUser({
        _id: userid
    }, cb);
};

/**
 * Delets a TODO list record
 *
 * @param {ObjectId} id TODO List Id
 * @param {succesCallback} cb Return callback
 */
TodoService.prototype.deleteTodoList = function (id, cb) {
    this.TodoListModel.remove({
        _id: id
    }, cb);
};


/**
 * Creates a new TODO entry
 * 
 * @param {ObjectId} listId List id to which TODO will be added
 * @param {string} text TODO text
 * @param {ObjectId} priorityId Id of TODO's priority
 * @param {Date} dueDate TODO's duw date
 * @param {objectCallback} cb Return callback
 */
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

/**
 * Gets all TODO entries from a TODO list
 * 
 * @param {ObjectId} listId List Id
 * @param {listCallback} cb Return callback
 */
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

/**
 * Gets all TODO entries from a all TODO list of an user
 * 
 * @param {ObjectId} userId User Id
 * @param {listCallback} cb Return callback
 */
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

/**
 * Gets a TODO entry details
 * 
 * @param {ObjectId} todoId TODO Id
 * @param {objectCallback} cb Return callback
 */
TodoService.prototype.getTodoById = function (todoId, cb) {
    if ('function' === typeof todoId) {
        cb = todoId;
        todoId = null;
    }

    if (!todoId) {
        cb('Invalid parameters: TodoId is mandatory', null);
        return;
    }

    this.TodoModel.findById(todoId, cb);
};

/**
 * Updates a TODO entry details
 * 
 * @param {Object} todo TODO's new details
 * @param {objectCallback} cb Return callback
 */
TodoService.prototype.updateTodo = function (todo, cb) {
    if ('function' === typeof todo) {
        cb = todo;
        todo = null;
    }

    if (!todo) {
        cb('Invalid parameters: TODO is mandatory', null);
        return;
    }

    this.getTodoById(todo._id, function (err, todoDB) {
        if (err) {
            cb(err, null);
        }

        var toUpdate = _.extend(todoDB, todo);

        toUpdate.save(cb);
    });
};

/**
 * Gets all not completed TODO entries from a TODO list
 * 
 * @param {ObjectId} listId TODO list Id
 * @param {listCallback} cb Return callback
 */
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

/**
 * Gets all completed TODO entries from a TODO list
 * 
 * @param {ObjectId} listId TODO list Id
 * @param {listCallback} cb Return callback
 */
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

/**
 * Delets a TODO entry record
 *
 * @param {ObjectId} id TODO Id
 * @param {succesCallback} cb Return callback
 */
TodoService.prototype.deleteTodo = function (id, cb) {
    this.TodoModel.remove({
        _id: id
    }, cb);
};

exports = module.exports = TodoService;