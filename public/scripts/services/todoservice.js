angular.module('meanTodoApp')
    .factory('todoService', function($http){
    return {
        getTodoList: function() {
            return $http.get('/api/user/login', {
                email: username,
                password: password
            });
        }
    };
});