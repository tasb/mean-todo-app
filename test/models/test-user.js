'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    UserSchema = require('../../app/models/user.js');

describe('User Model', function () {
    var db,
        User;

    function cleanUserCollection() {
        User.remove({}, function () {
        });
    }

    before(function () {
        db = mongoose.createConnection('mongodb://@127.0.0.1:27017/todo-test');
        User = db.model('user', UserSchema);
        cleanUserCollection();
    });

    describe('Adding user', function () {
        it('should return error when inserting a user without a email', function (done) {
            var wrongUser = new User({ });
            wrongUser.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.email.message.should.equal('Path `email` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a user without a valid email', function (done) {
            var wrongUser = new User({ email: 'test' });
            wrongUser.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.email.message.should.equal('invalid email address');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a user without a name', function (done) {
            var wrongUser = new User({ email: 'test@email.com' });
            wrongUser.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.name.message.should.equal('Path `name` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a user without a hashed password', function (done) {
            var wrongUser = new User({ email: 'test@email.com', name: 'Test user' });
            wrongUser.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.password.message.should.equal('Path `password` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a user without a security salt', function (done) {
            var wrongUser = new User({ email: 'test@email.com', name: 'Test user', password: 'PASSWORD' });
            wrongUser.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.salt.message.should.equal('Path `salt` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return success when inserting a user', function (done) {
            var okUser = new User({ email: 'test@email.com', name: 'Test user', password: 'PASSWORD', salt: 'SALT' });
            okUser.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(okUser);
                doc.should.have.property('email', 'test@email.com');
                doc.should.have.property('password', 'PASSWORD');
                doc.should.have.property('salt', 'SALT');
                numberAffected.should.equal(1);
                done();
            });
        });

        it('should return error when inserting a user with already added email', function (done) {
            var wrongUser = new User({ email: 'test@email.com', name: 'Test user', password: 'PASSWORD', salt: 'SALT' });
            wrongUser.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.containEql('duplicate key error');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });
    });

    after(function () {
        cleanUserCollection();
    });
});