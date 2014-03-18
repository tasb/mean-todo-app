'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    UserSchema = require('../../app/models/user.js');

describe('User Model', function () {
    var db,
        User;

    function cleanUserCollection() {
        User.remove({}).exec();
    }

    before(function () {
        db = mongoose.createConnection('mongodb://@127.0.0.1:27017/todo-test');
        User = db.model('user', UserSchema);
        cleanUserCollection();
    });

    describe('CRUD user', function () {
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
                doc.should.have.property('name', 'Test user');
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

        it('should return success when updating a user', function (done) {
            var okUser = new User({ email: 'test2@email.com', name: 'Test user', password: 'PASSWORD', salt: 'SALT' });
            okUser.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(okUser);
                doc.should.have.property('email', 'test2@email.com');
                doc.should.have.property('password', 'PASSWORD');
                doc.should.have.property('salt', 'SALT');
                doc.should.have.property('name', 'Test user');
                numberAffected.should.equal(1);

                doc.name = 'Test user 2';
                doc.update = new Date().getTime();

                doc.save(function (err, updated, numberAffected) {
                    should.not.exist(err);
                    should.exist(updated);
                    updated.should.equal(doc);
                    updated.should.have.property('email', 'test2@email.com');
                    updated.should.have.property('password', 'PASSWORD');
                    updated.should.have.property('salt', 'SALT');
                    updated.should.have.property('name', 'Test user 2');
                    numberAffected.should.equal(1);
                    done();
                });
            });
        });

        it('should return 1 record after removing a user', function (done) {
            User.remove({ email: 'test2@email.com'}, function (err) {
                should.not.exist(err);

                User.find({}, function (err, docs) {
                    should.not.exist(err);
                    should.exist(docs);
                    docs.should.be.instanceof(Array).and.have.lengthOf(1);
                    done();
                });
            });
        });

        it('should return 1 records when find user by name using "Test"', function (done) {
            User.findByName('Test', function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(1);
                done();
            });
        });
        it('should return zero records when find user by name using "Tiago"', function (done) {
            User.findByName('Tiago', function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(0);
                done();
            });
        });
        it('should return 1 records when find user by email using "test@email.com"', function (done) {
            User.findByEmail('test@email.com', function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(1);
                done();
            });
        });
        it('should return 0 records when find user by email using "test_error@email.com"', function (done) {
            User.findByEmail('test_error@email.com', function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(0);
                done();
            });
        });
    });

    after(function () {
        cleanUserCollection();
    });
});
