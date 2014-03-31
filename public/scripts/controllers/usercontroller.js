angular.module('meanTodoApp')
    .controller('UserController', function TodoController($scope, $routeParams, $filter, $window, $location, userService) {
        'use strict';

        $scope.login = function () {
            userService.login($scope.username, $scope.password)
                .success(function (data, status, headers, config) {
                    $window.sessionStorage.token = data.token;
                    $window.sessionStorage.userId = data.userId;
                    $location.path("/todoapp");
                })
                .error(function (data, status, headers, config) {
                    // Erase the token if the user fails to log in
                    delete $window.sessionStorage.token;
                    delete $window.sessionStorage.userId;

                    // Handle login errors here
                    $scope.message = 'Error: Invalid user or password';
                });
        }
    });