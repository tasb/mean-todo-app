'use strict';

var express = require('express'),
    TodoService = require('./services/todo.js'),
    UserService = require('./services/user.js'),
    RestAPI = require('./api/rest.js');

var Server = function (opts) {
    var self = this;

    self.cfg = opts || {};
    self.logger = self.cfg.log;
    self.server = null;
    self.userService = null;
    self.todoService = null;
    self.restApi = null;

    self.logErrors = function (err, req, res, next) {
        self.logger.error('logErrors', err.toString());
        next(err);
    };

    self.clientErrorHandler = function(err, req, res, next) {
        self.logger.error('clientErrors ', err.toString());
        res.send(500, { error: err.toString()});
        next(err);
    };

    self.errorHandler = function (err, req, res, next) {
        self.logger.error('lastErrors ', err.toString());
        res.send(500, {error: err.toString()});
    };

    self.bootstrap = function () {
        self.server = express();

        self.server.configure(function () {
            self.server.use(express.json());
            self.server.use(express.urlencoded());
            self.server.use(express.methodOverride());
            self.server.use(self.server.router);
            self.server.use(express.logger());
            self.server.use(express.static(__dirname + '/../public'));
            self.server.use(express.errorHandler({
                dumpExceptions: true,
                showStack: true
            }));
            self.server.use(self.logErrors);
            self.server.use(self.clientErrorHandler);
            self.server.use(self.errorHandler);
        });

        self.server.listen(self.cfg.port);

        self.userService = new UserService({
            log: self.cfg.log,
            storage: self.cfg.storage,
            cache: self.cfg.cache,
            hash: self.cfg.passwordConfig,
            misc: {
                tokenSize: self.cfg.passwordConfig.tokenSize,
                tokenExpire: self.cfg.passwordConfig.tokenExpire,
                missingPasswordRetries: self.cfg.passwordConfig.missingPasswordRetries,
            }
        });

        self.todoService = new TodoService({
            log: self.cfg.log,
            storage: self.cfg.storage
        });

        self.restApi = new RestAPI(self.server, {
            log: self.cfg.log,
            AuthToken: 'X-Auth-Token'
        }, {
            user: self.userService,
            todo: self.todoService
        });
    };

    self.bootstrap();
};

Server.prototype.init = function () {
    this.logger.info('Server started on port %s', this.cfg.port);
    this.restApi.init();
};

exports = module.exports = Server;