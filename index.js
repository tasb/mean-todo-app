'use strict';

var config = require("./config/config.json"),
    bunyan = require('bunyan'),
    nopt = require("nopt"),
    log = bunyan.createLogger({name: "betvictor-app"}),
    knownOpts = {
        "port" : [Number]
    },
    parsed = nopt(knownOpts, {}, process.argv, 2),
    TODOServer = require('./app/server.js');

var options = {
    log: log,
    port: parsed.port || config.DefaultPort,
    storage: config.Storage,
    cache: config.Cache,
    passwordConfig: config.PasswordConfig
};

log.level(config.LogLevel || "warn");

var server = new TODOServer(options);
server.init();