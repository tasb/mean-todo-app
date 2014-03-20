'use strict';

var should = require('should'),
    UserService = require('../../app/services/user.js');

describe('User Services', function () {
    var service,
        securityToken;

    function cleanUp() {

    }

    before(function () {
        service = new UserService({
            logLevel: 'trace',
            storage: {
                host: '127.0.0.1',
                port: '27017',
                database: 'todo-test'
            },
            cache: {
                host: '127.0.0.1',
                port: '6379',
                database: '5'
            },
            hash: {
                algorithm: 'pbkdf2',
                iterations: 1000,
                salt: 16,
                size: 256
            },
            opts: {
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
                err.message.should.equal('Invalid parameters: Email is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return error when creating a user without a name', function (done) {
            service.register('test@email.com', '', '', function (err, success) {
                should.exist(err);
                err.message.should.equal('Invalid parameters: Name is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return error when creating a user without a password', function (done) {
            service.register('test@email.com', 'Test User', '', function (err, success) {
                should.exist(err);
                err.message.should.equal('Invalid parameters: Name is mandatory');
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
                err.message.should.equal('Invalid credentials');
                should.not.exist(token);
                done();
            });
        });

        it('should return error when try to login without a password', function (done) {
            service.login('test@email.com', '', function (err, token) {
                should.exist(err);
                err.message.should.equal('Invalid credentials');
                should.not.exist(token);
                done();
            });
        });

        it('should return error when try to login with wrong password', function (done) {
            service.login('test@email.com', 'PASS', function (err, token) {
                should.exist(err);
                err.message.should.equal('Invalid credentials');
                should.not.exist(token);
                done();
            });
        });

        it('should return success when try to login with correct pasword', function (done) {
            service.login('test@email.com', 'PASSWORD', function (err, token) {
                should.not.exist(err);
                should.exist(token);
                securityToken = token;
                done();
            });
        });
    });

    describe('Logout user', function () {
        it('should return error when try to logout without a email', function (done) {
            service.logout('', function (err, success) {
                should.exist(err);
                err.message.should.equal('Invalid parameters: Email is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return error when try to logout a user that is not present on storage', function (done) {
            service.logout('test2@email.com', function (err, success) {
                should.exist(err);
                err.message.should.equal('Invalid user');
                should.not.exist(success);
                done();
            });
        });

        it('should return success when try to logout a user', function (done) {
            service.logout('test@email.com', 'PASSWORD', function (err, success) {
                should.not.exist(err);
                should.exist(success);
                success.should.be.ok;
                done();
            });
        });

        it('should return not success when try to logout a not logged in user', function (done) {
            service.logout('test@email.com', function (err, success) {
                should.not.exist(err);
                should.exist(success);
                success.should.not.be.ok;
                done();
            });
        });
    });

    after(function () {
        cleanUp();
    });
});
