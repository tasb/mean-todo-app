angular.module('meanTodoApp')
    .controller('UserController', function TodoController($scope, $window, $location, userService) {
        'use strict';

        function init() {
            if ($window.sessionStorage.token) {
                $location.path("/todoapp");
            }
        }

        $scope.submitForm = function (isValid) {
            // check to make sure the form is completely valid
            $scope.formValid = isValid;
            if (!isValid) {
                $scope.message = 'Please insert valid inputs';
            }
        };

        $scope.login = function () {
            $scope.message = null;
            $scope.signupMessage = null;

            if ($scope.formValid) {
                userService.login($scope.username, $scope.password)
                    .success(function (data) {
                        $window.sessionStorage.token = data.token;
                        $window.sessionStorage.userId = data.userId;
                        $window.sessionStorage.username = $scope.username;
                        $location.path("/todoapp");
                    })
                    .error(function () {
                        // Erase the token if the user fails to log in
                        delete $window.sessionStorage.token;
                        delete $window.sessionStorage.userId;
                        delete $window.sessionStorage.username;

                        // Handle login errors here
                        $scope.message = 'Error: Invalid user or password';
                    });
            }
        };

        $scope.signup = function () {
            $scope.message = null;
            $scope.signupMessage = null;

            if ($scope.formValid) {
                userService.register($scope.username, $scope.password)
                    .success(function () {
                        $scope.signupMessage = 'User created. Please login to editing your TODOs';
                    })
                    .error(function () {
                        // Handle login errors here
                        $scope.message = 'Error: Invalid user or password';
                    });
            }
        };

        init();
    });