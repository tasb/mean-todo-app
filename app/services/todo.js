'use strict';

var mongoose = require('mongoose');


/**
 * TodoService class implements all services related with user model:
 * register, login, validateToken and logout
 * 
 * @param {Object} opts The options for service
 *    @param {Object} opts.log Logger instance
 *    @param {Object} opts.storage Storage config. Where model will be persisted (Mongo Server)
 *      @param {string} opts.storage.host Storage config: hostname
 *      @param {string} opts.storage.port Storage config: port
 *      @param {string} opts.storage.database Storage config: database name
 *      @param {string} opts.storage.user Storage config: user to login on database
 *      @param {string} opts.storage.pass Storage config: pass to login on database
 */
var UserService = function (opts) {
    var self = this;
    self.cfg = opts || {};
    self.logger = opts.log;
    self.storage = null; // mongoose connection

    self.init = function () {
        self.storage = mongoose.createConnection();
        self.storage.open(self.cfg.storage.host, self.cfg.storage.database, self.cfg.storage.port, {
            user: self.cfg.storage.user,
            pass: self.cfg.storage.pass
        });
    };

    self.init();
};

exports = module.exports = UserService;