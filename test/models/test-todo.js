'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    UserSchema = require('../../app/models/user.js'),
    PrioritySchema = require('../../app/models/priority.js'),
    TodoSchema = require('../../app/models/todo.js'),
    TodoListSchema = require('../../app/models/todo-list.js');

describe('TODO Model', function () {
    var db,
        User,
        Todo,
        TodoList,
        Priority,
        mockPriority,
        mockUser,
        mockTodoList;

    function cleanUp() {
        Todo.remove({}).exec();
        TodoList.remove({}).exec();
        User.remove({}).exec();
        Priority.remove({}).exec();
    }

    before(function () {
        db = mongoose.createConnection('mongodb://@127.0.0.1:27017/todo-test');
        Priority = db.model('priority', PrioritySchema);
        User = db.model('user', UserSchema);
        Todo = db.model('todo', TodoSchema);
        TodoList = db.model('todolist', TodoListSchema);
        cleanUp();

        mockUser = new User({ email: 'test2@email.com', name: 'Test user', password: 'PASSWORD', salt: 'SALT' });
        mockUser.save();

        mockTodoList = new TodoList({ name: 'Shopping List', user: mockUser._id });
        mockTodoList.save();

        mockPriority = new Priority({ name: 'Urgent', order: 1, color: '#FF0000' });
        mockPriority.save();
    });

    describe('CRUD Todo', function () {
        it('should return error when inserting a TODO without a text', function (done) {
            var wrongTodo = new Todo({ });
            wrongTodo.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.text.message.should.equal('Path `text` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return error when inserting a TODO without specify TODO List', function (done) {
            var wrongTodo = new Todo({ text: 'Buy apples' });
            wrongTodo.save(function (err, doc, numberAffected) {
                should.exist(err);
                err.message.should.equal('Validation failed');
                err.errors.todoList.message.should.equal('Path `todoList` is required.');
                should.not.exist(doc);
                should.not.exist(numberAffected);
                done();
            });
        });

        it('should return success when inserting a TODO', function (done) {
            var okTodo = new Todo({ text: 'Buy Apples', todoList: mockTodoList._id });
            okTodo.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(okTodo);
                doc.should.have.property('text', 'Buy Apples');
                doc.should.have.property('todoList', mockTodoList._id);
                numberAffected.should.equal(1);
                done();
            });
        });

        it('should return success when inserting a TODO with all fields filled', function (done) {
            var okTodo = new Todo({ text: 'Buy Bananas', todoList: mockTodoList._id, dueDate: new Date().getDate() + 3, priority: mockPriority._id });
            okTodo.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(okTodo);
                doc.should.have.property('text', 'Buy Bananas');
                doc.should.have.property('todoList', mockTodoList._id);
                doc.should.have.property('priority', mockPriority._id);
                numberAffected.should.equal(1);
                done();
            });
        });

        it('should return success when updating a TODO list', function (done) {
            var updateTodo = new Todo({ text: 'Buy Peaches', todoList: mockTodoList._id });
            updateTodo.save(function (err, doc, numberAffected) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.equal(updateTodo);
                doc.should.have.property('text', 'Buy Peaches');
                doc.should.have.property('todoList', mockTodoList._id);
                numberAffected.should.equal(1);

                doc.text = 'Buy Strawberries';
                doc.dueDate = new Date().getDate() + 5;
                doc.priority = mockPriority._id;
                doc.updated = new Date().getTime();

                doc.save(function (err, updatedoc, numberAffected) {
                    should.not.exist(err);
                    should.exist(updatedoc);
                    updatedoc.should.equal(doc);
                    updatedoc.should.have.property('text', 'Buy Strawberries');
                    updatedoc.should.have.property('todoList', mockTodoList._id);
                    updatedoc.should.have.property('priority', mockPriority._id);
                    numberAffected.should.equal(1);
                    done();
                });
            });
        });

        it('should return 3 records when search TODO with {} query', function (done) {
            Todo.find({}, function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(3);
                done();
            });
        });

        it('should return 3 records when search TODO from "Shopping List" list', function (done) {
            Todo.findByTodoList(mockTodoList, function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(3);
                done();
            });
        });

        // it('should return 3 records when search TODO by user', function (done) {
        //     Todo.findByUser(mockUser, function (err, docs) {
        //         should.not.exist(err);
        //         should.exist(docs);
        //         docs.should.be.instanceof(Array).and.have.lengthOf(3);
        //         done();
        //     });
        // });

        it('should return zero records when search TODO by text "Sell"', function (done) {
            Todo.findByText('Sell', function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(0);
                done();
            });
        });

        it('should return zero records when search TODO by text "Sell" on TODO List "Shopping List"', function (done) {
            Todo.findByTextOnTodoList('Sell', mockTodoList, function (err, docs) {
                should.not.exist(err);
                should.exist(docs);
                docs.should.be.instanceof(Array).and.have.lengthOf(0);
                done();
            });
        });
    });

    after(function () {
        cleanUp();
    });
});