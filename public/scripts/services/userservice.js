angular.module('meanTodoApp')
    .factory('userService', function($http){
    return {
        login: function(username, password) {
            return $http.post('/api/user/login', {
                email: username,
                password: password
            });
        },
        register: function(username, password) {
            return $http.post('/api/user', {
                email: username,
                name: username,
                password: password
            });
        },
        logout: function(username, token) {
            return $http.post('/api/user/logout', {
                email: username
            }, { headers: 
                { 'X-Auth-Token': token }
            });
        }
    };
});