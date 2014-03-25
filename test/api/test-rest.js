'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    request = require('request'),
    TodoService = require('../../app/services/todo.js'),
    UserService = require('../../app/services/user.js'),
    RestAPI = require('../../app/api/rest.js');

describe('REST API Testing', function () {
    var userSrv,
        todoSrv,
        rest;

    function cleanUp() {
    }

    before(function () {
        console.info = function () { };
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
            log: console
        }, {
            user: userSrv,
            todo: todoSrv
        });
        rest.init();

        cleanUp();
    });

    after(function () {
        cleanUp();
    });
});
