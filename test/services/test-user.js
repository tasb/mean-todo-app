'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    UserService = require('../../app/services/user.js'),
    UserSchema = require('../../app/models/user.js');

describe('User Services', function () {
    var service;

    function cleanUp() {
        var db = mongoose.createConnection('mongodb://@127.0.0.1:27017/todo-test'),
            User = db.model('user', UserSchema);
        User.remove({}).exec();
    }

    before(function () {
        service = new UserService({
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
        cleanUp();
    });

    describe('Register user', function () {
        it('should return error when creating a user without a email', function (done) {
            service.register('', '', '', function (err, success) {
                should.exist(err);
                err.should.equal('Invalid parameters: Email is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return error when creating a user without a name', function (done) {
            service.register('test@email.com', '', '', function (err, success) {
                should.exist(err);
                err.should.equal('Invalid parameters: Name is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return error when creating a user without a password', function (done) {
            service.register('test@email.com', 'Test User', '', function (err, success) {
                should.exist(err);
                err.should.equal('Invalid parameters: Password is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return succes when creating a user with all elements', function (done) {
            service.register('test@email.com', 'Test User', 'PASSWORD', function (err, success) {
                should.not.exist(err);
                should.exist(success);
                done();
            });
        });
    });

    describe('Login user', function () {
        it('should return error when try to login without a email', function (done) {
            service.login('', '', function (err, token) {
                should.exist(err);
                err.should.equal('Invalid credentials');
                should.not.exist(token);
                done();
            });
        });

        it('should return error when try to login without a password', function (done) {
            service.login('test@email.com', '', function (err, token) {
                should.exist(err);
                err.should.equal('Invalid credentials');
                should.not.exist(token);
                done();
            });
        });

        it('should return error when try to login with wrong password', function (done) {
            service.login('test@email.com', 'PASS', function (err, token) {
                should.exist(err);
                err.should.equal('Invalid credentials');
                should.not.exist(token);
                done();
            });
        });

        it('should return success when try to login with correct pasword', function (done) {
            service.register('test2@email.com', 'Test User', 'PASSWORD', function (err, success) {
                should.not.exist(err);
                should.exist(success);
                service.login('test2@email.com', 'PASSWORD', function (err, token) {
                    should.not.exist(err);
                    should.exist(token);
                    done();
                });
            });
        });
    });

    describe('Validate token', function () {
        it('should return not success when validating an invalid token', function (done) {
            service.validateToken('XXXXXXXXXXXX', function (err, success) {
                should.not.exist(err);
                should.exist(success);
                success.should.be.not.ok;
                done();
            });
        });

        it('should return success when validating an valid token', function (done) {
            service.register('test3@email.com', 'Test User', 'PASSWORD', function (err, success) {
                should.not.exist(err);
                should.exist(success);
                service.login('test3@email.com', 'PASSWORD', function (err, token) {
                    should.not.exist(err);
                    should.exist(token);
                    service.validateToken(token, function (err, success) {
                        should.not.exist(err);
                        should.exist(success);
                        success.should.be.ok;
                        done();
                    });
                });
            });
        });
    });

    describe('Logout user', function () {
        it('should return error when try to logout without a email', function (done) {
            service.logout('', function (err, success) {
                should.exist(err);
                err.should.equal('Invalid parameters: Email is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return success when try to logout a user', function (done) {
            service.logout('test@email.com', function (err, success) {
                should.not.exist(err);
                should.exist(success);
                success.should.be.ok;
                done();
            });
        });
    });

    after(function () {
        cleanUp();
    });
});
