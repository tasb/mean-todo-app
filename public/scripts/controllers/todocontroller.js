angular.module('meanTodoApp')
    .controller('TodoController', function TodoController($scope, $routeParams, $location, $window, todoService, userService) {
        'use strict';

        $scope.loggedIn = true;
        $scope.priorities = [];
        $scope.todos = [];
        $scope.todoListId = null;
        $scope.predicate = 'name';
        $scope.reverse = false;

        function init() {
            if (!$window.sessionStorage.token) {
                $location.path("/");
            }
        };

        function getAllTodos() {
            todoService.getTodos($window.sessionStorage.token, $window.sessionStorage.userId, $scope.todoListId)
                .success(function (data) {
                    $scope.todos = data;
                })
                .error(function () {
                    $scope.message = 'Error getting TODO entries';
                });
        };

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
                }).error (function () {
                    $scope.message = 'Cannot added TODO';
                });
        };

        $scope.mark = function (index) {
            var todo = $scope.todos[index];
            todoService.markCompleted($window.sessionStorage.token, $window.sessionStorage.userId, 
                $scope.todoListId, todo).success(function (data) {
                    getAllTodos();
                }).error (function () {
                    $scope.message = 'Cannot added TODO';
                });
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