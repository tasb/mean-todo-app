'use strict';


/**
 * UserService class implements all services related with user model:
 * register, login, validateToken and logout
 * 
 * @param {json} opts The options for service
 *    @param {Object} opts.log Logger instance
 *    @param {Object} opts.storage Storage config. Where model will be persisted (Mongo Server)
 *      @param {string} opts.storage.host Storage config: hostname
 *      @param {string} opts.storage.port Storage config: port
 *      @param {string} opts.storage.database Storage config: database name
 *      @param {string} opts.storage.user Storage config: user to login on database
 *      @param {string} opts.storage.pass Storage config: pass to login on database
 *    @param {Object} opts.cache Cache configuration to store valid tokens (Redis Server)
 *      @param {string} opts.cache.host Storage config: hostname
 *      @param {string} opts.cache.port Storage config: port
 *      @param {Number} opts.cache.database Storage config: database number
 *      @param {string} opts.cache.pass Storage config: pass to login on database
 *    @param {Object} opts.hash Password hashing algorithm configuration
 *      @param {string} opts.hash.algorithm Algorithm to be used (available options: pbkdf2 (only))
 *      @param {Number} opts.hash.iteration Number of iteration to be used on algorithm
 *      @param {Number} opts.hash.salt Salt size (in bytes)
 *      @param {Number} opts.hash.size Password hash size (in bytes)
 *    @param {Object} opts.misc Misc options
 *      @param {Number} opts.misc.tokenExpire Token validation ttl (in seconds)
 *      @param {Number} opts.misc.missingPasswordRetries Allowed number of missing password before blocking (0 means no validation)
 */
var UserService = function (opts) {
    this.cfg = opts || {};
    this.logger = opts.log;
};

/**
 * This callback type is called `successCallback` and is displayed as a global symbol.
 *
 * @callback successCallback
 * @param {string} err - error message when an error occurs
 * @param {boolean} success - indicates if the operation runs with success
 */

 /**
 * This callback type is called `loginCallback` and is displayed as a global symbol.
 *
 * @callback loginCallback
 * @param {string} err - error message when an error occurs
 * @param {string} token - authenticated token to use on other services
 */


/**
 * Register one user on application
 * 
 * @param {string} email User email
 * @param {string} name User name
 * @param {string} password User password (may be in plain text or already an hash)
 * @param {successCallback} cb Return callback
 */
UserService.prototype.register = function (email, name, password, cb) {

};


/**
 * Login a user on application
 * 
 * @param {string} email User email
 * @param {string} password User password (may be in plain text or already an hash)
 * @param {loginCallback} cb Return callback
 */
UserService.prototype.login = function (email, password, cb) {

};


/**
 * Checks if a token is valid
 * 
 * @param {string} token Token to be validated
 * @param {successCallback} cb Return callback
 */
UserService.prototype.validateToken = function (token, cb) {

};


/**
 * Logouts a user. Invalidates his token
 * 
 * @param {string} token User token
 * @param {string} email User email
 * @param {successCallback} cb Return callback
 */
UserService.prototype.logout = function (token, email, cb) {

};

exports = module.exports = UserService;