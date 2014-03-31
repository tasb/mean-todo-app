angular.module('meanTodoApp')
    .factory('userService', function($http){
    return {
        login: function(username, password) {
            return $http.post('/api/user/login', {
                email: username,
                password: password
            });
        }
    };
});