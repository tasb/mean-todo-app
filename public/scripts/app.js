'use strict';


angular.module('meanTodoApp', ['ngRoute', 'ngQuickDate', 'angular-table'], 
    function ($routeProvider, $locationProvider, $httpProvider) {
    var interceptor = ['$rootScope', '$q', '$location', function (scope, $q) {

        function success(response) {
            return response;
        }

        function error(response) {
            var status = response.status;

            if (status == 401) {
                delete window.sessionStorage.token;
                delete window.sessionStorage.userId;
                delete window.sessionStorage.username;
                window.location = "./";
                return;
            }
            // otherwise
            return $q.reject(response);

        }

        return function (promise) {
            return promise.then(success, error);
        }

    }];
    $httpProvider.responseInterceptors.push(interceptor);
    })
    .config(function ($routeProvider) {

        $routeProvider.when('/', {
            controller: 'UserController',
            templateUrl: 'views/login.html'
        }).when('/todoapp', {
            controller: 'TodoController',
            templateUrl: 'views/todo.html'
        }).otherwise({
            redirectTo: '/'
        });
    });