'use strict';

var should = require('should'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    express = require('express'),
    mocks = require('../mocks.js'),
    TodoSchema = require('../../app/models/todo.js'),
    TodoListSchema = require('../../app/models/todo-list.js'),
    UserSchema = require('../../app/models/user.js'),
    TodoService = require('../../app/services/todo.js'),
    UserService = require('../../app/services/user.js'),
    RestAPI = require('../../app/api/rest.js');

describe('REST API Testing', function () {
    var userSrv,
        todoSrv,
        rest,
        url,
        server;

    function cleanUp() {
        var db = mongoose.createConnection('mongodb://@127.0.0.1:27017/todo-test'),
            UserModel = db.model('user', UserSchema),
            TodoModel = db.model('todo', TodoSchema),
            TodoListModel = db.model('todolist', TodoListSchema);

        UserModel.remove({}).exec();
        TodoModel.remove({}).exec();
        TodoListModel.remove({}).exec();
    }

    before(function () {
        server = express();

        server.configure(function () {
            server.use(express.bodyParser());
            server.use(express.methodOverride());
            server.use(server.router);
            server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        });
        server.listen(9000);

        url = 'http://127.0.0.1:9000';
        userSrv = new UserService({
            log: mocks.mockLogger,
            storage: {
                host: '127.0.0.1',
                port: '27017',
                database: 'todo-test'
            },
            cache: {
                host: '127.0.0.1',
                port: '6379',
                database: '2'
            },
            hash: {
                algorithm: 'pbkdf2',
                iterations: 10000,
                salt: 16,
                size: 256
            },
            misc: {
                tokenSize: 32,
                tokenExpire: 3600,
                missingPasswordRetries: 0
            }
        });
        todoSrv = new TodoService({
            log: mocks.mockLogger,
            storage: {
                host: '127.0.0.1',
                port: '27017',
                database: 'todo-test'
            }
        });

        rest = new RestAPI(server, {
            log: mocks.mockLogger,
            AuthToken: 'X-Auth-Token'
        }, {
            user: userSrv,
            todo: todoSrv
        });
        rest.init();

        cleanUp();
    });

    describe('POST on /api/user', function () {
        it('should create a new user', function (done) {
            var body = {
                email: 'test@email.com',
                name: 'Test user',
                password: 'PASSWORD'
            };

            request(url)
                .post('/api/user')
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    should.not.exist(err);
                    res.body.should.have.property('_id');
                    res.body.email.should.equal('test@email.com');
                    res.body.name.should.equal('Test user');
                    done();
                });
        });
    });

    describe('POST on /api/user/login', function () {
        before(function (done) {
            var body = {
                email: 'test2@email.com',
                name: 'Test user',
                password: 'PASSWORD'
            };
            request(url)
                .post('/api/user')
                .send(body)
                .end(function (err) {
                    if (err) {
                        throw err;
                    }
                    done();
                });
        });
        it('should login a new user and gets a token', function (done) {
            var loginBody = {
                email: 'test2@email.com',
                password: 'PASSWORD'
            };
            request(url)
                .post('/api/user/login')
                .send(loginBody)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    should.not.exist(err);
                    should.exist(res.body.token);
                    done();
                });
        });
    });

    describe('POST on /api/user/logout', function () {
        var token;
        before(function (done) {
            var body = {
                email: 'test3@email.com',
                name: 'Test user 3',
                password: 'PASSWORD'
            };

            request(url)
                .post('/api/user')
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    var loginBody = {
                        email: res.body.email,
                        password: 'PASSWORD'
                    };
                    request(url)
                        .post('/api/user/login')
                        .send(loginBody)
                        .expect('Content-Type', /json/)
                        .expect(200) //Status code
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }
                            should.not.exist(err);
                            should.exist(res.body.token);
                            token = res.body.token;
                            done();
                        });
                });
        });

        it('should return error about missing security token', function (done) {
            var body = {
                email: 'test2@email.com'
            };

            request(url)
                .post('/api/user/logout')
                .send(body)
                .expect('Content-Type', /json/)
                .expect(401) //Status code
                .end(function (err, res) {
                    should.not.exist(err);
                    res.statusCode.should.equal(401);
                    done();
                });
        });

        it('should return success when logout a logged user', function (done) {
            var body = {
                email: 'test3@email.com'
            };

            request(url)
                .post('/api/user/logout')
                .set('X-Auth-Token', token)
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.success.should.be.ok;
                    done();
                });
        });
    });

    describe('TODO Lists Actions', function () {
        var token,
            userId;

        before(function (done) {
            var body = {
                email: 'testTodoLists@email.com',
                name: 'Test TODO Lists',
                password: 'PASSWORD'
            };

            request(url)
                .post('/api/user')
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    userId = res.body._id;

                    var loginBody = {
                        email: res.body.email,
                        password: 'PASSWORD'
                    };
                    request(url)
                        .post('/api/user/login')
                        .send(loginBody)
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }
                            token = res.body.token;
                            done();
                        });
                });
        });

        describe('POST on /api/user/:userid/todolist', function () {
            it('should return error about missing security token', function (done) {
                var body = {
                        name: 'Shopping List'
                    };

                request(url)
                    .post('/api/user/' + userId + '/todolist')
                    .send(body)
                    .expect('Content-Type', /json/)
                    .expect(401) //Status code
                    .end(function (err, res) {
                        should.not.exist(err);
                        res.statusCode.should.equal(401);
                        done();
                    });
            });

            it('should create a new todolist', function (done) {
                var body = {
                    name: 'Shopping List'
                };

                request(url)
                    .post('/api/user/' + userId + '/todolist')
                    .set('X-Auth-Token', token)
                    .send(body)
                    .expect('Content-Type', /json/)
                    .expect(200) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        should.not.exist(err);
                        res.body.should.have.property('_id');
                        res.body.name.should.equal('Shopping List');
                        done();
                    });
            });
        });

        describe('GET on /api/user/:userid/todolist', function () {
            it('should return a list of todolist from user', function (done) {

                request(url)
                    .get('/api/user/' + userId + '/todolist')
                    .set('X-Auth-Token', token)
                    .expect('Content-Type', /json/)
                    .expect(200) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        should.not.exist(err);
                        res.body.should.be.instanceof(Array).and.have.lengthOf(1);
                        res.body[0].name.should.equal('Shopping List');
                        done();
                    });
            });
        });

        describe('GET on /api/user/:userid/todolist/:todolistid', function () {
            it('should return "Shopping List" todolist', function (done) {

                request(url)
                    .get('/api/user/' + userId + '/todolist')
                    .set('X-Auth-Token', token)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        var todolistId = res.body[0]._id;
                        request(url)
                            .get('/api/user/' + userId + '/todolist/' + todolistId)
                            .set('X-Auth-Token', token)
                            .expect('Content-Type', /json/)
                            .expect(200) //Status code
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }
                                should.not.exist(err);
                                res.body.name.should.equal('Shopping List');
                                res.body._id.should.equal(todolistId);
                                done();
                            });
                    });
            });
        });
    });

    describe('TODO Actions', function () {
        var token,
            userId,
            listId;

        before(function (done) {
            var body = {
                email: 'testTodos@email.com',
                name: 'Test TODOs',
                password: 'PASSWORD'
            };

            request(url)
                .post('/api/user')
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    userId = res.body._id;

                    var loginBody = {
                        email: res.body.email,
                        password: 'PASSWORD'
                    };
                    request(url)
                        .post('/api/user/login')
                        .send(loginBody)
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }
                            token = res.body.token;

                            var listBody = {
                                name: 'Shopping List'
                            };

                            request(url)
                                .post('/api/user/' + userId + '/todolist')
                                .set('X-Auth-Token', token)
                                .send(listBody)
                                .end(function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    listId = res.body._id;
                                    done();
                                });
                        });
                });
        });

        describe('POST on /api/user/:userid/todolist/:todolistid/todo', function () {
            it('should create a new todo', function (done) {
                var body = {
                    text: 'Buy Apples'
                };

                request(url)
                    .post('/api/user/' + userId + '/todolist/' + listId + '/todo')
                    .set('X-Auth-Token', token)
                    .send(body)
                    .expect('Content-Type', /json/)
                    .expect(200) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        should.not.exist(err);
                        res.body.should.have.property('_id');
                        res.body.text.should.equal('Buy Apples');
                        done();
                    });
            });
        });

        describe('GET on /api/user/:userid/todolist/:todolistid/todo', function () {
            it('should return a list of todos from todo list', function (done) {
                request(url)
                    .get('/api/user/' + userId + '/todolist/' + listId + '/todo')
                    .set('X-Auth-Token', token)
                    .expect('Content-Type', /json/)
                    .expect(200) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        should.not.exist(err);
                        res.body.should.be.instanceof(Array).and.have.lengthOf(1);
                        res.body[0].text.should.equal('Buy Apples');
                        done();
                    });

            });
        });

        describe('GET on /api/user/:userid/todolist/:todolistid/todo/:todoid', function () {
            it('should return details of a todo entry', function (done) {
                request(url)
                    .get('/api/user/' + userId + '/todolist/' + listId + '/todo')
                    .set('X-Auth-Token', token)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }

                        var todoId = res.body[0]._id;

                        request(url)
                            .get('/api/user/' + userId + '/todolist/' + listId + '/todo/' + todoId)
                            .set('X-Auth-Token', token)
                            .expect('Content-Type', /json/)
                            .expect(200) //Status code
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }
                                should.not.exist(err);
                                res.body.text.should.equal('Buy Apples');
                                res.body._id.should.equal(todoId);
                                done();
                            });
                    });

            });
        });

        describe('PUT on /api/user/:userid/todolist/:todolistid/todo/:todoid', function () {
            var todoId;

            before(function (done) {
                var body = {
                    text: 'Buy Starwberries'
                };

                request(url)
                    .post('/api/user/' + userId + '/todolist/' + listId + '/todo')
                    .set('X-Auth-Token', token)
                    .send(body)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        todoId = res.body._id;
                        done();
                    });
            });

            it('should return a update a todo entry', function (done) {
                request(url)
                    .get('/api/user/' + userId + '/todolist/' + listId + '/todo/' + todoId)
                    .set('X-Auth-Token', token)
                    .expect(200) //Status code
                    .end(function (err, todo) {
                        if (err) {
                            throw err;
                        }

                        todo.body.text = 'Buy Bananas';
                        todo.body.dueDate = new Date();
                        todo.body.completed = true;

                        request(url)
                            .put('/api/user/' + userId + '/todolist/' + listId + '/todo/' + todoId)
                            .set('X-Auth-Token', token)
                            .send(todo.body)
                            .expect('Content-Type', /json/)
                            .expect(200) //Status code
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }
                                should.not.exist(err);
                                res.body.text.should.equal('Buy Bananas');
                                res.body.completed.should.be.ok;
                                done();
                            });

                    });
            });
        });

        describe('DELETE on /api/user/:userid/todolist/:todolistid/todo/:todoid', function () {
            var todoId;

            before(function (done) {
                var body = {
                    text: 'Buy Peaches'
                };

                request(url)
                    .post('/api/user/' + userId + '/todolist/' + listId + '/todo')
                    .set('X-Auth-Token', token)
                    .send(body)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        todoId = res.body._id;
                        done();
                    });
            });

            it('should return a update a todo entry', function (done) {
                var deleteBody = {
                };

                request(url)
                    .del('/api/user/' + userId + '/todolist/' + listId + '/todo/' + todoId)
                    .set('X-Auth-Token', token)
                    .send(deleteBody)
                    .expect('Content-Type', /json/)
                    .expect(200) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        should.not.exist(err);
                        res.body.success.should.be.ok;
                        done();
                    });
            });
        });
    });

    after(function () {
        cleanUp();
    });
});
