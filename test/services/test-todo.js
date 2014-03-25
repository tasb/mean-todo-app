'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    TodoService = require('../../app/services/todo.js'),
    TodoSchema = require('../../app/models/todo.js'),
    TodoListSchema = require('../../app/models/todo-list.js'),
    UserSchema = require('../../app/models/user.js'),
    PrioritySchema = require('../../app/models/priority.js');

describe('TODO Services', function () {
    var db,
        UserModel,
        PriorityModel,
        TodoListModel,
        TodoModel,
        service,
        user,
        list,
        priority;

    function cleanUp() {
        UserModel.remove({}).exec();
        PriorityModel.remove({}).exec();
        TodoModel.remove({}).exec();
        TodoListModel.remove({}).exec();
    }

    before(function () {
        console.info = function () {
        };
        service = new TodoService({
            log: console,
            storage: {
                host: '127.0.0.1',
                port: '27017',
                database: 'todo-test'
            }
        });
        db = mongoose.createConnection('mongodb://@127.0.0.1:27017/todo-test');
        UserModel = db.model('user', UserSchema);
        PriorityModel = db.model('priority', PrioritySchema);
        TodoModel = db.model('todo', TodoSchema);
        TodoListModel = db.model('todolist', TodoListSchema);

        cleanUp();

        user = new UserModel({ email: 'test@email.com', name: 'Test user', password: 'PASSWORD', salt: 'SALT' });
        user.save();
    });

    describe('Create and Delete Priorities', function () {
        it('should return error when try to create a priority without a name', function (done) {
            service.newPriority('', 1, '#FF0000', function (err, success) {
                should.exist(err);
                err.should.equal('Invalid parameters: Name is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return error when try to create a priority without an order number', function (done) {
            service.newPriority('High', function (err, success) {
                should.exist(err);
                err.should.equal('Invalid parameters: Order is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return success when creating a priority', function (done) {
            service.newPriority('Urgent', 1, '#FF0000', function (err, success) {
                should.not.exist(err);
                should.exist(success);
                done();
            });
        });

        it('should return success when creating a priority without color', function (done) {
            service.newPriority('High', 2, function (err, success) {
                should.not.exist(err);
                should.exist(success);
                done();
            });
        });

        it('should return two records when listing all priorities', function (done) {
            service.getPriorities(function (err, priorities) {
                should.not.exist(err);
                should.exist(priorities);
                priorities.should.be.instanceof(Array).and.have.lengthOf(2);
                done();
            });
        });

        it('should return success when deleting a priority', function (done) {
            service.getPriorities(function (err, priorities) {
                should.not.exist(err);
                should.exist(priorities);
                priorities.should.be.instanceof(Array).and.have.lengthOf(2);

                service.deletePriority(priorities[1]._id, function (err, success) {
                    should.not.exist(err);
                    should.exist(success);

                    service.getPriorities(function (err, priorities) {
                        should.not.exist(err);
                        should.exist(priorities);
                        priorities.should.be.instanceof(Array).and.have.lengthOf(1);
                        done();
                    });
                });
            });
        });
    });

    describe('Create and Delete TodoList', function () {
        it('should return error when try to create a TODO list without a user', function (done) {
            service.newTodoList(null, function (err, success) {
                should.exist(err);
                err.should.equal('Invalid parameters: User is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return error when try to create a TODO list without a name', function (done) {
            service.newTodoList(user._id, function (err, success) {
                should.exist(err);
                err.should.equal('Invalid parameters: Name is mandatory');
                should.not.exist(success);
                done();
            });
        });

        it('should return success when creating a TODO List', function (done) {
            service.newTodoList(user._id, 'Shopping Cart', function (err, success) {
                should.not.exist(err);
                should.exist(success);
                done();
            });
        });

        it('should return one record when listing all TODO list from one user', function (done) {
            service.getTodoListByUser(user._id, function (err, lists) {
                should.not.exist(err);
                should.exist(lists);
                lists.should.be.instanceof(Array).and.have.lengthOf(1);
                done();
            });
        });

        it('should return success when deleting a TODO list', function (done) {
            service.getTodoListByUser(user._id, function (err, lists) {
                should.not.exist(err);
                should.exist(lists);
                lists.should.be.instanceof(Array).and.have.lengthOf(1);

                service.deleteTodoList(lists[0], function (err, success) {
                    should.not.exist(err);
                    should.exist(success);

                    service.getTodoListByUser(user._id, function (err, lists) {
                        should.not.exist(err);
                        should.exist(lists);
                        lists.should.be.instanceof(Array).and.have.lengthOf(0);
                        done();
                    });
                });
            });
        });
    });

    describe('Create and Delete TODO', function () {
        before(function (done) {
            service.newTodoList(user, 'Default', function (err, res) {
                list = res;
                service.getPriorities(function (err, priorities) {
                    priority = priorities[0];
                    done();
                });
            });
        });

        it('should return success when try to create a TODO only with Text', function (done) {
            service.newTodo(list._id, 'Buy Apples', function (err, todo) {
                should.not.exist(err);
                should.exist(todo);
                todo.text.should.equal('Buy Apples');
                done();
            });
        });

        it('should return success when try to create a TODO with Text and priority', function (done) {
            service.newTodo(list._id, 'Buy Bananas', priority._id, function (err, todo) {
                should.not.exist(err);
                should.exist(todo);
                todo.text.should.equal('Buy Bananas');
                todo.priority.should.eql(priority._id);
                done();
            });
        });

        it('should return success when try to create a TODO with Text, priority and due date', function (done) {
            service.newTodo(list._id, 'Buy Strawberries', priority._id, new Date(), function (err, todo) {
                should.not.exist(err);
                should.exist(todo);
                todo.text.should.equal('Buy Strawberries');
                todo.priority.should.eql(priority._id);
                done();
            });
        });

        it('should return three records when listing all TODO list from one list', function (done) {
            service.getTodosFromList(list._id, function (err, todos) {
                should.not.exist(err);
                should.exist(todos);
                todos.should.be.instanceof(Array).and.have.lengthOf(3);
                done();
            });
        });

        // it('should return three records when listing all TODO list from one user', function (done) {
        //     service.getTodosFromUser(user._id, function (err, todos) {
        //         should.not.exist(err);
        //         should.exist(todos);
        //         todos.should.be.instanceof(Array).and.have.lengthOf(3);
        //         done();
        //     });
        // });

        it('should return success editing a TODO', function (done) {
            service.getTodosFromList(list._id, function (err, todos) {
                should.not.exist(err);
                should.exist(todos);
                todos.should.be.instanceof(Array).and.have.lengthOf(3);

                todos[0].completed = true;

                service.updateTodo(todos[0], function (err, todo) {
                    should.not.exist(err);
                    should.exist(todo);
                    todo.completed.should.be.ok;
                    done();
                });
            });
        });

        it('should return 2 records when listing all TODOs not completed from a list', function (done) {
            service.getTodosFromListNotCompleted(list._id, function (err, todos) {
                should.not.exist(err);
                should.exist(todos);
                todos.should.be.instanceof(Array).and.have.lengthOf(2);
                done();
            });
        });

        it('should return 1 record when listing all TODOs completed from a list', function (done) {
            service.getTodosFromListCompleted(list._id, function (err, todos) {
                should.not.exist(err);
                should.exist(todos);
                todos.should.be.instanceof(Array).and.have.lengthOf(1);
                done();
            });
        });

        it('should return success when deleting a TODO', function (done) {
            service.getTodosFromListCompleted(list._id, function (err, todos) {
                should.not.exist(err);
                should.exist(todos);
                todos.should.be.instanceof(Array).and.have.lengthOf(1);

                service.deleteTodo(todos[0]._id, function (err, success) {
                    should.not.exist(err);
                    should.exist(success);

                    service.getTodosFromListCompleted(list._id, function (err, lists) {
                        should.not.exist(err);
                        should.exist(lists);
                        lists.should.be.instanceof(Array).and.have.lengthOf(0);
                        done();
                    });
                });
            });
        });
    });

    after(function () {
        cleanUp();
    });
});
