'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    PrioritySchema = require('../../app/models/priority.js');

describe('Priority', function () {
    var db,
        Priority;

    before(function () {
        db = mongoose.createConnection('mongodb://@127.0.0.1:27017/todo-test');
        Priority = db.model('priority', PrioritySchema);
    });

    describe('CRUD Priority', function () {
        it('should return error when inserting a priority without a name', function (done) {
            var wrongPriority = new Priority({ order: 1, color: 'color' });
            wrongPriority.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.name.message.should.equal('Path `name` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a priority without an order number', function (done) {
            var wrongPriority = new Priority({ name: 'Urgent', color: 'color' });
            wrongPriority.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.order.message.should.equal('Path `order` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a priority without an order number less than 1', function (done) {
            var wrongPriority = new Priority({ name: 'Urgent', order: 0, color: 'color' });
            wrongPriority.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.order.message.should.equal('Path `order` () is less than minimum allowed value (1).');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a priority with a bad format color', function (done) {
            var wrongPriority = new Priority({ name: 'Urgent', order: 1, color: 'color' });
            wrongPriority.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.color.message.should.equal('Path `color` is invalid (color).');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return success when inserting a priority', function (done) {
            var okPriority = new Priority({ name: 'Urgent', order: 1, color: '#FF0000' });
            okPriority.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(okPriority);
                numberAffected.should.equal(1);
                done();
            });
        });

        it('should return error when inserting a priority with same namer', function (done) {
            var wrongPriority = new Priority({ name: 'Urgent', order: 2, color: '#FF0000' });
            wrongPriority.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.containEql('duplicate key error');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a priority with same order number', function (done) {
            var wrongPriority = new Priority({ name: 'Normal', order: 1, color: '#FF0000' });
            wrongPriority.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.containEql('duplicate key error');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return success when updating a priority', function (done) {
            var updatePriority = new Priority({ name: 'High', order: 2, color: '#00FF00' });
            updatePriority.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(updatePriority);
                numberAffected.should.equal(1);

                doc.color = '#00FF55';
                doc.updated = new Date().getTime();

                doc.save(function (err, updatedoc, numberAffected) {
                    should.not.exist(err);
                    should.exist(doc);
                    updatedoc.should.equal(doc);
                    numberAffected.should.equal(1);
                    done();
                });
            });
        });

        it('should return two records when find priority with {} query', function (done) {
            Priority.find({}, function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(2);
                done();
            });
        });

        it('should return zero records when find priority by name using "Low"', function (done) {
            Priority.findByName('Low', function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(0);
                done();
            });
        });

        it('should return two records when finding all priority ordered by "order" property', function (done) {
            Priority.findByName('', function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(2);
                docs[0].order.should.be.lessThan(docs[1].order);
                docs[1].order.should.be.greaterThan(docs[0].order);
                done();
            });
        });
    });

    after(function () {
        Priority.remove({}, function () {
            console.log('collection removed');
        });
    });
});