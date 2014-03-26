'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    request = require('supertest'),
    TodoService = require('../../app/services/todo.js'),
    UserService = require('../../app/services/user.js'),
    RestAPI = require('../../app/api/rest.js');

describe('REST API Testing', function () {
    var userSrv,
        todoSrv,
        rest,
        url;

    function cleanUp() {
    }

    before(function () {
        console.info = function () { };
        url = 'http://127.0.0.1:9000';
        userSrv = new UserService({
            log: console,
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
                tokenSize: 256,
                tokenExpire: 3600,
                missingPasswordRetries: 0,
            }
        });
        todoSrv = new TodoService({
            log: console,
            storage: {
                host: '127.0.0.1',
                port: '27017',
                database: 'todo-test'
            }
        });

        rest = new RestAPI({
            log: console,
            port: 9000
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
                pass: 'PASSWORD'
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
                pass: 'PASSWORD'
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
                pass: 'PASSWORD'
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
                pass: 'PASSWORD'
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
                        pass: 'PASSWORD'
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
                .end(function (err) {
                    should.exist(err);
                    err.should.equal('Unauthorized');
                    done();
                });
        });

        it('should return success when logout a logged user', function (done) {
            var body = {
                email: 'test2@email.com',
                token: token
            };

            request(url)
                .post('/api/user/logout')
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
                pass: 'PASSWORD'
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
                        pass: 'PASSWORD'
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

        describe('POST on /api/user/:id/todolist', function () {
            it('should return error about missing security token', function (done) {
                var body = {
                        name: 'Shopping List',
                        token: token
                    };

                request(url)
                    .post('/api/user/' + userId + '/todolist')
                    .send(body)
                    .expect('Content-Type', /json/)
                    .expect(401) //Status code
                    .end(function (err) {
                        should.exist(err);
                        err.should.equal('Unauthorized');
                        done();
                    });
            });

            it('should create a new todolist', function (done) {
                var body = {
                    name: 'Shopping List',
                    token: token
                };

                request(url)
                    .post('/api/user/' + userId + '/todolist')
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

        describe('GET on /api/user/:id/todolist', function () {
            it('should return a list of todolist from user', function (done) {

                request(url)
                    .get('/api/user/' + userId + '/todolist?token=' + token)
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
    });

    describe('TODO Actions', function () {
        var token,
            userId,
            listId;

        before(function (done) {
            var body = {
                email: 'testTodos@email.com',
                name: 'Test TODOs',
                pass: 'PASSWORD'
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
                        pass: 'PASSWORD'
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
                                name: 'Shopping List',
                                token: token
                            };

                            request(url)
                                .post('/api/user/' + userId + '/todolist')
                                .send(listBody)
                                .end(function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    listId = res.body._id;
                                    done();
                                });

                            done();
                        });
                });
        });

        describe('POST on /api/user/:id/todolist/:id/todo', function () {
            it('should create a new todo', function (done) {
                var body = {
                    text: 'Buy Apples',
                    token: token
                };

                request(url)
                    .post('/api/user/' + userId + '/todolist/' + listId + '/todo')
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

        describe('GET on /api/user/:id/todolist/:id/todo', function () {
            it('should return a list of todos from todo list', function (done) {
                request(url)
                    .get('/api/user/' + userId + '/todolist/' + listId + '/todo?token=' + token)
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

        describe('PUT on /api/user/:id/todolist/:id/todo/:id', function () {
            var todoId;

            before(function (done) {
                var body = {
                    text: 'Buy Starwberries',
                    token: token
                };

                request(url)
                    .post('/api/user/' + userId + '/todolist/' + listId + '/todo')
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
                var dueDate = new Date(),
                    updateBody = {
                        text: 'Buy Bananas',
                        dueDate: dueDate,
                        completed: true,
                        token: token
                    };

                request(url)
                    .put('/api/user/' + userId + '/todolist/' + listId + '/todo/' + todoId)
                    .send(updateBody)
                    .expect('Content-Type', /json/)
                    .expect(200) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        should.not.exist(err);
                        res.body.text.should.equal('Buy Bananas');
                        res.body.completed.should.be.ok;
                        res.body.dueDate.should.equal(dueDate);
                        done();
                    });

            });
        });

        describe('DELETE on /api/user/:id/todolist/:id/todo/:id', function () {
            var todoId;

            before(function (done) {
                var body = {
                    text: 'Buy Peaches',
                    token: token
                };

                request(url)
                    .post('/api/user/' + userId + '/todolist/' + listId + '/todo')
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
                    token: token
                };

                request(url)
                    .delete('/api/user/' + userId + '/todolist/' + listId + '/todo/' + todoId)
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
