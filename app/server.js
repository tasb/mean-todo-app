'use strict';

var express = require('express'),
    crypto = require('crypto'),
    https = require('https'),
    fs = require('fs'),
    TodoService = require('./services/todo.js'),
    UserService = require('./services/user.js'),
    RestAPI = require('./api/rest.js');

var Server = function (opts) {
    var self = this;

    self.cfg = opts || {};
    self.logger = self.cfg.log;
    self.httpsServer = null;
    self.app = null;
    self.userService = null;
    self.todoService = null;
    self.restApi = null;

    self.logErrors = function (err, req, res, next) {
        self.logger.error('logErrors', err.toString());
        next(err);
    };

    self.clientErrorHandler = function (err, req, res, next) {
        self.logger.error('clientErrors ', err.toString());
        res.send(500, { error: err.toString()});
        next(err);
    };

    self.errorHandler = function (err, req, res, next) {
        self.logger.error('lastErrors ', err.toString());
        res.send(500, {error: err.toString()});
    };

    self.bootstrap = function () {
        self.app = express();

        var privateKey = fs.readFileSync(self.cfg.security.PrivateKey).toString(),
            certificate = fs.readFileSync(self.cfg.security.Certificate).toString(),
            credentials = {key: privateKey, cert: certificate};

        self.app.configure(function () {
            self.app.use(express.json());
            self.app.use(express.urlencoded());
            self.app.use(express.methodOverride());
            self.app.use(self.app.router);
            self.app.use(express.logger());
            self.app.use(express.static(__dirname + '/../public'));
            self.app.use(express.errorHandler({
                dumpExceptions: true,
                showStack: true
            }));
            self.app.use(self.logErrors);
            self.app.use(self.clientErrorHandler);
            self.app.use(self.errorHandler);
        });

        self.httpsServer = https.createServer(credentials, self.app);
        self.httpsServer.listen(self.cfg.port);
        //self.app.listen(self.cfg.port);

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

        self.restApi = new RestAPI(self.app, {
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