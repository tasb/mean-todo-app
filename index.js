'use strict';

var config = require("./config/config.json"),
    bunyan = require('bunyan'),
    log = bunyan.createLogger({name: "betvictor-app"}),
    TODOServer = require('./app/server.js');

var options = {
    log: log,
    port: 9000,
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
    passwordConfig: {
        algorithm: 'pbkdf2',
        iterations: 10000,
        salt: 16,
        size: 256,
        tokenSize: 32,
        tokenExpire: 3600,
        missingPasswordRetries: 0
    }
};

log.level(config.LogLevel || "warn");

var server = new TODOServer(options);
server.init();