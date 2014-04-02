angular.module('meanTodoApp')
    .controller('TodoController', function TodoController($scope, $routeParams, $location, $window, todoService, userService) {
        'use strict';

        $scope.loggedIn = true;
        $scope.priorities = [];
        $scope.todos = [];
        $scope.todoListId = null;
        $scope.predicate = 'text';
        $scope.reverse = false;
        $scope.username = $window.sessionStorage.username;

        function init() {
            if (!$window.sessionStorage.token) {
                $location.path("/");
            }
        }

        function getAllTodos() {
            todoService.getTodos($window.sessionStorage.token, $window.sessionStorage.userId, $scope.todoListId)
                .success(function (data) {
                    $scope.todos = data;
                })
                .error(function () {
                    $scope.message = 'Error getting TODO entries';
                });
        }

        function getTodoById(id) {
            var index,
                todo;

            for (index = $scope.todos.length-1; index >= 0; index--) {
                todo = $scope.todos[index];
                if (todo._id === id) {
                    return todo;
                }
            }

            return null;
        }

        todoService.getPriorities().success(function (data) {
            $scope.priorities = data;
        });

        todoService.getTodoList($window.sessionStorage.token, $window.sessionStorage.userId).success(function (data) {
            if (!data.length) {
                todoService.newTodoList($window.sessionStorage.token, $window.sessionStorage.userId).success(function (list) {
                    $scope.todoListId = list._id;
                    getAllTodos();
                });
            } else {
                $scope.todoListId = data[0]._id;
                getAllTodos();
            }
        });

        $scope.addTodo = function () {
            todoService.addTodo($window.sessionStorage.token, $window.sessionStorage.userId, $scope.todoListId,
                $scope.todo.text, $scope.todo.dueDate, $scope.todo.priority).success(function (data) {
                    getAllTodos();
                }).error (function (data) {
                    $scope.message = 'Cannot added TODO: ' + data;
                });
        };

        $scope.mark = function (id) {
            var todo = getTodoById(id);

            if (todo) {
                todoService.markCompleted($window.sessionStorage.token, $window.sessionStorage.userId, 
                    $scope.todoListId, todo).success(function (data) {
                        getAllTodos();
                    }).error (function (data) {
                        $scope.message = 'Cannot mark as completed TODO: ' + data;
                    });
            } else {
                $scope.message = 'Something wrong with your data. Cannot find TODO';
            }
        };

        $scope.deleteTodo = function (id) {
            var todo = getTodoById(id);
            if (todo) {
                todoService.deleteTodo($window.sessionStorage.token, $window.sessionStorage.userId, 
                    $scope.todoListId, todo._id).success(function (data) {
                        getAllTodos();
                    }).error (function (data) {
                        $scope.message = 'Cannot delete TODO: ' + data;
                    });
            } else {
                $scope.message = 'Something wrong with your data. Cannot find TODO';
            }
        };

        $scope.logout = function () {
            userService.logout($window.sessionStorage.username, $window.sessionStorage.token)
                .success(function (data) {
                    if (data.success) {
                        delete $window.sessionStorage.token;
                        delete $window.sessionStorage.userId;
                        delete $window.sessionStorage.username;
                        $location.path('/');
                    }
                })
        };

        init();
    });