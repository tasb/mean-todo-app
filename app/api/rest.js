'use strict';

var RestAPI = function (opts, services) {
    var self = this;
    self.cfg = opts || {};
    self.logger = opts.log;
    self.userService = services.user;
    self.todoService = services.todo;

    if (!self.userService) {
        throw new Error('REST API cannot start without user services');
    }

    if (!self.todoService) {
        throw new Error('REST API cannot start without todo services');
    }
};

exports = module.exports = RestAPI;