angular.module('meanTodoApp')
    .factory('todoService', function($http){
    return {
        getPriorities: function() {
            return $http.get('/api/priority');
        },
        getTodoList: function(token, userId) {
            return $http.get('/api/todolist', { headers: 
                { 'X-Auth-Token': token,
                'X-User-Id': userId }
            });
        },
        newTodoList: function(token, userId) {
            return $http.post('/api/todolist', { name: 'Default' }, { headers: 
                { 'X-Auth-Token': token,
                'X-User-Id': userId }
            });
        },
        getTodos: function(token, userId, todolistId) {
            return $http.get('/api/todolist/' + todolistId + '/todo', { headers: 
                { 'X-Auth-Token': token,
                'X-User-Id': userId }
            });
        },
        addTodo: function (token, userId, todolistId, text, dueDate, priority) {
            var body = {
                text: text,
                dueDate: dueDate,
                priorityId: priority
            };
            return $http.post('/api/todolist/' + todolistId + '/todo', body, { headers: 
                { 'X-Auth-Token': token,
                'X-User-Id': userId }
            });
        },
        markCompleted: function (token, userId, todolistId, todo) {
            return $http.put('/api/todolist/' + todolistId + '/todo/' + todo._id, todo, { headers: 
                { 'X-Auth-Token': token,
                'X-User-Id': userId }
            });
        }
    };
});