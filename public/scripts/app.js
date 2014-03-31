/**
 * The main app module
 *
 * @type {angular.Module}
 */
angular.module('meanTodoApp', ['ngRoute', 'ngQuickDate', 'angular-table'])
    .config(function ($routeProvider) {
        'use strict';

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
    