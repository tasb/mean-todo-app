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

    self.sendError = function (res, code, message) {
        if (!message) {
            message = http.STATUS_CODES[code];
        }

        var body = {
            code: code,
            message: message
        };

        res.type('json');
        res.send(code).send(body);
    };

    self.registerUser = function (req, res) {
        if (!req.body.email) {
            self.sendError(res, 400, 'Missing email parameter');
            return;
        }

        if (!req.body.name) {
            self.sendError(res, 400, 'Missing name parameter');
            return;
        }

        if (!req.body.password) {
            self.sendError(res, 400, 'Missing password parameter');
            return;
        }

        self.handlers.user.register(req.body.email, req.body.name, req.body.password, function (err, user) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            res.set('Content-Type', 'aplication/json');
            res.type('json');
            res.send(200, user);
        });
    };

    self.loginUser = function (req, res) {
        if (!req.body.email) {
            self.sendError(res, 400, 'Missing email parameter');
            return;
        }

        if (!req.body.password) {
            self.sendError(res, 400, 'Missing password parameter');
            return;
        }

        self.handlers.user.login(req.body.email, req.body.password, function (err, token) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            res.set('Content-Type', 'aplication/json');
            res.type('json');
            res.send(200, { token: token });
        });
    };

    self.logoutUser = function (req, res) {
        if (!req.body.email) {
            self.sendError(res, 400, 'Missing email parameter');
            return;
        }

        if (!req.body.token) {
            self.sendError(res, 401);
            return;
        }

        self.handlers.user.validateToken(req.body.token, function (err, email) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            if (email !== req.body.email) {
                self.sendError(res, 401);
                return;
            }

            self.handlers.user.logout(req.body.email, function (err, success) {
                if (err) {
                    self.sendError(res, 500, err);
                    return;
                }

                res.set('Content-Type', 'aplication/json');
                res.type('json');
                res.send(200, { success: success });
            });
        });
    };

    self.createTodoList = function (req, res) {
        if (!req.body.token) {
            self.sendError(res, 401);
            return;
        }

        if (!req.body.name) {
            self.sendError(res, 400, 'Missing name parameter');
            return;
        }

        self.handlers.user.getUser(req.params.userid, function (err, user) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            self.handlers.user.validateToken(req.body.token, function (err, email) {
                if (err) {
                    self.sendError(res, 500, err);
                    return;
                }

                if (email !== user.email) {
                    self.sendError(res, 401);
                    return;
                }

                self.handlers.todo.newTodoList(req.params.userid, req.body.name, function (err, list) {
                    if (err) {
                        self.sendError(res, 500, err);
                        return;
                    }

                    res.set('Content-Type', 'aplication/json');
                    res.type('json');
                    res.send(200, list);
                });
            });
        });
    };

    self.getTodoLists = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.getTodoListDetails = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.createTodo = function (req, res) {
        res.status(501).send(http.STATUS_CODES[501]);
    };

    self.getTodosFromList = function (req, res) {
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
    self.server.get('/api/user/:userid/todolist', self.getTodoLists);
    self.server.get('/api/user/:userid/todolist/:todolistid', self.getTodoListDetails);
    self.server.post('/api/user/:userid/todolist/:todolistid/todo', self.createTodo);
    self.server.get('/api/user/:userid/todolist/:todolistid/todo', self.getTodosFromList);
    self.server.get('/api/user/:userid/todolist/:todolistid/todo/:todoid', self.getTodoDetail);
    self.server.put('/api/user/:userid/todolist/:todolistid/todo/:todoid', self.updateTodo);
    self.server.delete('/api/user/:userid/todolist/:todolistid/todo/:todoid', self.deleteTodo);

    self.server.listen(self.cfg.port);
};

exports = module.exports = RestAPI;