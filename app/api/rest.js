'use strict';

var http = require('http');

var RestAPI = function (opts, server, handlers) {
    var self = this;
    self.cfg = opts || {};
    self.logger = opts.log;
    self.handlers = handlers;
    self.server = server;

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

    self.checkPermission = function (userId, token, cb) {
        self.handlers.user.getUser(userId, function (err, user) {
            if (err) {
                cb(err, null);
                return;
            }

            self.handlers.user.validateToken(token, function (err, email) {
                if (err) {
                    cb(err, null);
                    return;
                }

                cb(null, (email === user.email));
            });
        });
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

        var token = req.get(self.cfg.AuthToken);

        if (!token) {
            self.sendError(res, 401);
            return;
        }

        self.handlers.user.validateToken(token, function (err, email) {
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
        if (!req.get(self.cfg.AuthToken)) {
            self.sendError(res, 401);
            return;
        }

        if (!req.body.name) {
            self.sendError(res, 400, 'Missing name parameter');
            return;
        }

        self.checkPermission(req.params.userid, req.get(self.cfg.AuthToken), function (err, permitted) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            if (!permitted) {
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
    };

    self.getTodoLists = function (req, res) {
        if (!req.get(self.cfg.AuthToken)) {
            self.sendError(res, 401);
            return;
        }

        self.checkPermission(req.params.userid, req.get(self.cfg.AuthToken), function (err, permitted) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            if (!permitted) {
                self.sendError(res, 401);
                return;
            }

            self.handlers.todo.getTodoListByUser(req.params.userid, function (err, results) {
                if (err) {
                    self.sendError(res, 500, err);
                    return;
                }

                res.set('Content-Type', 'aplication/json');
                res.type('json');
                res.send(200, results);
            });

        });
    };

    self.getTodoListDetails = function (req, res) {
        if (!req.get(self.cfg.AuthToken)) {
            self.sendError(res, 401);
            return;
        }

        self.checkPermission(req.params.userid, req.get(self.cfg.AuthToken), function (err, permitted) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            if (!permitted) {
                self.sendError(res, 401);
                return;
            }

            self.handlers.todo.getTodoListById(req.params.todolistid, function (err, list) {
                if (err) {
                    self.sendError(res, 500, err);
                    return;
                }

                res.set('Content-Type', 'aplication/json');
                res.type('json');
                res.send(200, list);
            });

        });
    };

    self.createTodo = function (req, res) {
        if (!req.get(self.cfg.AuthToken)) {
            self.sendError(res, 401);
            return;
        }

        if (!req.body.text) {
            self.sendError(res, 400, 'Missing text parameter');
            return;
        }

        self.checkPermission(req.params.userid, req.get(self.cfg.AuthToken), function (err, permitted) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            if (!permitted) {
                self.sendError(res, 401);
                return;
            }

            self.handlers.todo.newTodo(req.params.todolistid, req.body.text, req.body.priorityId, req.body.dueDate, function (err, todo) {
                if (err) {
                    self.sendError(res, 500, err);
                    return;
                }

                res.set('Content-Type', 'aplication/json');
                res.type('json');
                res.send(200, todo);
            });

        });
    };

    self.getTodosFromList = function (req, res) {
        if (!req.get(self.cfg.AuthToken)) {
            self.sendError(res, 401);
            return;
        }

        self.checkPermission(req.params.userid, req.get(self.cfg.AuthToken), function (err, permitted) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            if (!permitted) {
                self.sendError(res, 401);
                return;
            }

            self.handlers.todo.getTodosFromList(req.params.todolistid, function (err, todos) {
                if (err) {
                    self.sendError(res, 500, err);
                    return;
                }

                res.set('Content-Type', 'aplication/json');
                res.type('json');
                res.send(200, todos);
            });

        });
    };

    self.getTodoDetail = function (req, res) {
        if (!req.get(self.cfg.AuthToken)) {
            self.sendError(res, 401);
            return;
        }

        self.checkPermission(req.params.userid, req.get(self.cfg.AuthToken), function (err, permitted) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            if (!permitted) {
                self.sendError(res, 401);
                return;
            }

            self.handlers.todo.getTodoById(req.params.todoid, function (err, todo) {
                if (err) {
                    self.sendError(res, 500, err);
                    return;
                }

                res.set('Content-Type', 'aplication/json');
                res.type('json');
                res.send(200, todo);
            });

        });
    };

    self.updateTodo = function (req, res) {
        if (!req.get(self.cfg.AuthToken)) {
            self.sendError(res, 401);
            return;
        }

        self.checkPermission(req.params.userid, req.get(self.cfg.AuthToken), function (err, permitted) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            if (!permitted) {
                self.sendError(res, 401);
                return;
            }

            self.handlers.todo.updateTodo(req.body, function (err, todo) {
                if (err) {
                    self.sendError(res, 500, err);
                    return;
                }

                res.set('Content-Type', 'aplication/json');
                res.type('json');
                res.send(200, todo);
            });

        });
    };

    self.deleteTodo = function (req, res) {
        if (!req.get(self.cfg.AuthToken)) {
            self.sendError(res, 401);
            return;
        }

        self.checkPermission(req.params.userid, req.get(self.cfg.AuthToken), function (err, permitted) {
            if (err) {
                self.sendError(res, 500, err);
                return;
            }

            if (!permitted) {
                self.sendError(res, 401);
                return;
            }

            self.handlers.todo.deleteTodo(req.params.todoid, function (err, success) {
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
};

RestAPI.prototype.init = function () {
    this.server.post('/api/user', this.registerUser);
    this.server.post('/api/user/login', this.loginUser);
    this.server.post('/api/user/logout', this.logoutUser);
    this.server.post('/api/user/:userid/todolist', this.createTodoList);
    this.server.get('/api/user/:userid/todolist', this.getTodoLists);
    this.server.get('/api/user/:userid/todolist/:todolistid', this.getTodoListDetails);
    this.server.post('/api/user/:userid/todolist/:todolistid/todo', this.createTodo);
    this.server.get('/api/user/:userid/todolist/:todolistid/todo', this.getTodosFromList);
    this.server.get('/api/user/:userid/todolist/:todolistid/todo/:todoid', this.getTodoDetail);
    this.server.put('/api/user/:userid/todolist/:todolistid/todo/:todoid', this.updateTodo);
    this.server.delete('/api/user/:userid/todolist/:todolistid/todo/:todoid', this.deleteTodo);
};

exports = module.exports = RestAPI;