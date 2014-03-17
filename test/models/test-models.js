'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    PrioritySchema = require('../app/models/priority.js');

suite('Priority', function () {
    var db,
        priority;

    setup(function () {
        db = mongoose.createConnection('mongodb://@127.0.0.1:27017/todo-test');
        priority = db.model('priority', PrioritySchema);
    });

    suite('#indexOf()', function () {
        test('should return -1 when not present', function () {

        });
    });
});