'use strict';

var express = require('express'),
    http = require('http');

var RestAPI = function (opts, handlers) {
    var self = this;
    self.cfg = opts || {};
    self.logger = opts.log;
    self.handlers = handlers;
    self.server = null;

    if (!self.handlers.user) {
        throw new Error('REST API cannot start without user services');
    }

    if (!self.handlers.todo) {
        throw new Error('REST API cannot start without todo services');
    }

    self.registerUser = function (req, res) {
        if (!req.body.email) {
            res.status(400).send('Missing email parameter');
            return;
        }

        if (!req.body.name) {
            res.status(400).send('Missing name parameter');
            return;
        }

        if (!req.body.password) {
            res.status(400).send('Missing password parameter');
            return;
        }

        self.handlers.user.register(req.body.email, req.body.name, req.body.password, function (err, user) {
            if (err) {
                res.status(501).send(err);
                return;
            }

            res.set('Content-Type', 'aplication/json');
            res.json(200, user);
        });
    };

    self.loginUser = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.logoutUser = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.createTodoList = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.getTodoList = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.createTodo = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.getTodoDetail = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.updateTodo = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.deleteTodo = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };
};

RestAPI.prototype.init = function () {
    var self = this;

    self.server = express();

    self.server.configure(function () {
        self.server.use(express.bodyParser());
        self.server.use(express.methodOverride());
        self.server.use(self.server.router);
        self.server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    self.server.post('/api/user', self.registerUser);
    self.server.post('/api/user/login', self.loginUser);
    self.server.post('/api/user/logout', self.logoutUser);
    self.server.post('/api/user/:userid/todolist', self.createTodoList);
    self.server.get('/api/user/:userid/todolist', self.getTodoList);
    self.server.post('/api/user/:userid/todolist/:todolistid/todo', self.createTodo);
    self.server.get('/api/user/:userid/todolist/:todolistid/todo', self.getTodoDetail);
    self.server.put('/api/user/:userid/todolist/:todolistid/todo/:todoid', self.updateTodo);
    self.server.delete('/api/user/:userid/todolist/:todolistid/todo/:todoid', self.deleteTodo);

    self.server.listen(self.cfg.port);
};

exports = module.exports = RestAPI;