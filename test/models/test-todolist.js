'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    UserSchema = require('../../app/models/user.js'),
    TodoListSchema = require('../../app/models/todo-list.js');

describe('TODO List Model', function () {
    var db,
        User,
        TodoList,
        mockUser,
        mockUser2;

    function cleanUp() {
        TodoList.remove({}).exec();
        User.remove({}).exec();
    }

    before(function () {
        db = mongoose.createConnection('mongodb://@127.0.0.1:27017/todo-test');
        User = db.model('user', UserSchema);
        TodoList = db.model('todolist', TodoListSchema);
        cleanUp();

        mockUser = new User({ email: 'test@email.com', name: 'Test user', password: 'PASSWORD', salt: 'SALT' });
        mockUser.save();

        mockUser2 = new User({ email: 'test2@email.com', name: 'Test user', password: 'PASSWORD', salt: 'SALT' });
        mockUser2.save();
    });

    describe('CRUD Todo List', function () {
        it('should return error when inserting a TODO list without a name', function (done) {
            var wrongTodoList = new TodoList({ });
            wrongTodoList.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.name.message.should.equal('Path `name` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a TODO list without a user', function (done) {
            var wrongTodoList = new TodoList({ name: 'Shopping List' });
            wrongTodoList.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.user.message.should.equal('Path `user` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return success when inserting a TODO list', function (done) {
            var okTodoList = new TodoList({ name: 'Shopping List', user: mockUser._id });
            okTodoList.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(okTodoList);
                doc.should.have.property('name', 'Shopping List');
                doc.should.have.property('user', mockUser._id);
                numberAffected.should.equal(1);
                done();
            });
        });

        it('should return success when inserting a TODO list with same name for another user', function (done) {
            var okTodoList = new TodoList({ name: 'Shopping List', user: mockUser2._id });
            okTodoList.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(okTodoList);
                doc.should.have.property('name', 'Shopping List');
                doc.should.have.property('user', mockUser2._id);
                numberAffected.should.equal(1);
                done();
            });
        });

        it('should return error when inserting a TODO list with same name for same user', function (done) {
            var wrongTodoList = new TodoList({ name: 'Shopping List', user: mockUser._id });
            wrongTodoList.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.containEql('duplicate key error');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return success when updating a TODO list', function (done) {
            var updatePriority = new TodoList({ name: 'Party List', user: mockUser._id });
            updatePriority.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(updatePriority);
                doc.should.have.property('name', 'Party List');
                doc.should.have.property('user', mockUser._id);
                numberAffected.should.equal(1);

                doc.name = 'Birthday Party List';
                doc.updated = new Date().getTime();

                doc.save(function (err, updatedoc, numberAffected) {
                    should.not.exist(err);
                    should.exist(updatedoc);
                    updatedoc.should.equal(doc);
                    updatedoc.should.have.property('name', 'Birthday Party List');
                    updatedoc.should.have.property('user', mockUser._id);
                    numberAffected.should.equal(1);
                    done();
                });
            });
        });

        it('should return 3 records when search TODO List with {} query', function (done) {
            TodoList.find({}, function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(3);
                done();
            });
        });

        it('should return zero records when search TODO List by name using "School List"', function (done) {
            TodoList.findByName('School List', function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(0);
                done();
            });
        });

        it('should return two records when search TODO List by user for mockUser', function (done) {
            TodoList.findByUser(mockUser._id, function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(2);
                done();
            });
        });
    });

    after(function () {
        cleanUp();
    });
});