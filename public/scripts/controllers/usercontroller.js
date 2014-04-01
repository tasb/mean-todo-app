angular.module('meanTodoApp')
    .controller('UserController', function TodoController($scope, $routeParams, $filter, $window, $location, userService) {
        'use strict';

        function init() {
            if ($window.sessionStorage.token) {
                $location.path("/todoapp");
            }
        };

        $scope.login = function () {
            userService.login($scope.username, $scope.password)
                .success(function (data, status, headers, config) {
                    $window.sessionStorage.token = data.token;
                    $window.sessionStorage.userId = data.userId;
                    $window.sessionStorage.username = $scope.username;
                    $location.path("/todoapp");
                })
                .error(function (data, status, headers, config) {
                    // Erase the token if the user fails to log in
                    delete $window.sessionStorage.token;
                    delete $window.sessionStorage.userId;
                    delete $window.sessionStorage.username;

                    // Handle login errors here
                    $scope.message = 'Error: Invalid user or password';
                });
        };

        $scope.signup = function () {
            userService.register($scope.username, $scope.password)
                .success(function (data, status, headers, config) {
                    $scope.signupMessage = 'User created. Please login to editing your TODOs';
                })
                .error(function (data, status, headers, config) {
                    // Handle login errors here
                    $scope.message = 'Error: Invalid user or password';
                });
        };

        init();
    });