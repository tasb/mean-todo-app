'use strict';

var crypto = require('crypto'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    UserSchema = require('../models/user.js');


/**
 * UserService class implements all services related with user model:
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
 *      @param {Number} opts.misc.tokenSize Token size (in bytes)
 *      @param {Number} opts.misc.tokenExpire Token validation ttl (in seconds)
 *      @param {Number} opts.misc.missingPasswordRetries Allowed number of missing password before blocking (0 means no validation)
 */
var UserService = function (opts) {
    var self = this;
    self.cfg = opts || {};
    self.logger = opts.log;
    self.storage = null; // mongoose connection
    self.UserModel = null; // User model
    self.cache = null; // Redis connection

    self.init = function () {
        self.storage = mongoose.createConnection();
        self.storage.open(self.cfg.storage.host, self.cfg.storage.database, self.cfg.storage.port, {
            user: self.cfg.storage.user,
            pass: self.cfg.storage.pass
        });
        self.UserModel = self.storage.model('user', UserSchema);

        self.cache = redis.createClient(self.cfg.cache.port, self.cfg.cache.host);
        self.cache.on('error', function (err) {
            self.logger.error('[UserService] Error on cache access. Details: ' + err);
        });

        if (self.cfg.cache.pass) {
            self.cache.auth(self.cfg.cache.pass, function (err) {
                if (err) {
                    self.logger.error('[UserService] Error on AUTH command. Details: ' + err);
                    return;
                }

                self.logger.info('[UserService] Success on AUTH command!');
            });
        }

        if (self.cfg.cache.database) {
            self.cache.select(self.cfg.cache.database, function (err) {
                if (err) {
                    self.logger.error('[UserService] Error on SELECT command. Details: ' + err);
                    return;
                }

                //self.logger.info('[UserService] Success on SELECT command!');
            });
        }
    };

    self.compilePassword = function (pass, salt) {
        if (!salt) {
            salt = crypto.randomBytes(self.cfg.hash.salt);
            salt = salt.toString('hex');
        }

        var passBuf = crypto.pbkdf2Sync(pass, salt, this.cfg.hash.iterations, this.cfg.hash.size);

        return {
            salt: salt,
            pass: passBuf.toString('hex')
        };
    };

    self.generateToken = function (email) {
        var token = crypto.randomBytes(self.cfg.misc.tokenSize);
        token = token.toString('hex');

        self.cache.set(email, token);
        self.cache.set(token, email);
        self.cache.expire(email, self.cfg.misc.tokenExpire);
        self.cache.expire(token, self.cfg.misc.tokenExpire);

        return token;
    };

    self.checkToken = function (token, cb) {
        self.cache.exists(token, function (err, result) {
            if (err) {
                self.logger.error('[User Service] Error getting value for key ' + token + '. Details: ' + err);
                cb(err, null);
                return;
            }

            cb(null, result);
        });
    };

    self.invalidateToken = function (email, cb) {
        self.cache.get(email, function (err, token) {
            if (err) {
                self.logger.error('[User Service] Error getting value for key ' + token + '. Details: ' + err);
                cb(err, null);
                return;
            }

            self.cache.del(email);
            self.cache.del(token);
        });
    };

    self.init();
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
    this.logger.info('[User Service] Register user. Name: %s, email: %s', name, email);
    if (('string' !== typeof email) ||
            (email === '')) {
        cb('Invalid parameters: Email is mandatory', null);
        return;
    }

    if (('string' !== typeof name) ||
            (name === '')) {
        cb('Invalid parameters: Name is mandatory', null);
        return;
    }

    if (('string' !== typeof password) ||
            (password === '')) {
        cb('Invalid parameters: Password is mandatory', null);
        return;
    }

    if ('function' !== typeof cb) {
        cb('Invalid parameters: Callback is mandatory', null);
        return;
    }

    var credentials = this.compilePassword(password),
        user = new this.UserModel({
            email: email,
            name: name,
            password: credentials.pass,
            salt: credentials.salt
        });

    user.save(cb);
};


/**
 * Login a user on application
 * 
 * @param {string} email User email
 * @param {string} password User password (may be in plain text or already an hash)
 * @param {loginCallback} cb Return callback
 */
UserService.prototype.login = function (email, password, cb) {
    var self = this;
    self.logger.info('[User Service] Login user. Email: %s', email);

    if (('string' !== typeof email) ||
            (email === '')) {
        cb('Invalid credentials', null);
        return;
    }

    if (('string' !== typeof password) ||
            (password === '')) {
        cb('Invalid credentials', null);
        return;
    }

    if ('function' !== typeof cb) {
        cb('Invalid parameters: Callback is mandatory', null);
        return;
    }

    self.UserModel.findByEmail(email, function (err, docs) {
        if (err) {
            cb(err, null);
            return;
        }

        if (docs.length === 0) {
            cb('Invalid credentials', null);
            return;
        }

        var thisUser = docs[0],
            credentials = self.compilePassword(password, thisUser.salt),
            token = null;

        if (credentials.pass !== thisUser.password) {
            cb('Invalid credentials', null);
            return;
        }

        token = self.generateToken(email);
        cb(null, token);
    });
};


/**
 * Checks if a token is valid
 * 
 * @param {string} token Token to be validated
 * @param {successCallback} cb Return callback
 */
UserService.prototype.validateToken = function (token, cb) {
    this.logger.info('[User Service] Validate token.');
    if (('string' !== typeof token) ||
            (token === '')) {
        cb('Invalid parameters: Token is mandatory', null);
        return;
    }

    if ('function' !== typeof cb) {
        cb('Invalid parameters: Callback is mandatory', null);
        return;
    }

    this.checkToken(token, cb);
};


/**
 * Logouts a user. Invalidates his token
 * 
 * @param {string} token User token
 * @param {string} email User email
 * @param {successCallback} cb Return callback
 */
UserService.prototype.logout = function (email, cb) {
    this.logger.info('[User Service] Logout user. Email: %s', email);
    if (('string' !== typeof email) ||
            (email === '')) {
        cb('Invalid parameters: Email is mandatory', null);
        return;
    }

    if ('function' !== typeof cb) {
        cb('Invalid parameters: Callback is mandatory', null);
        return;
    }

    this.invalidateToken(email);
    cb(null, true);
};

exports = module.exports = UserService;