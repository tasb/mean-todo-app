TODO List
=========

Todo list management single web page application using MEAN stack

Features
--------
- List my todos
- Manipulate my list (add/remove/modify)
- Assign priorities and due dates
- Sort my lists using due date and priority
- Mark an entry as completed.
- Every client operation done using JavaScript
- RESTful API
- Credentials to both the webpage and the API
- Signup/register system to create and authenticate users

Tech
----

* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [Angular.js] - javascript MVW framework for front-end
* [MongoDB] - NoSQl database for persistence
* [Mongoose] - mongo ORM module for node.js
* [Mocha] - BDD/TDD testing framework for node.js

Prerequesite
------------

Must have a [MongoDb] server running on 27017 port of your localhost. If you want to use a Mongo server on another host, please open config file (config/database.json) to set proper settings.

Installation
--------------

```sh
git clone [git-repo-url] todoapp
cd todoapp
npm install
```

Running
--------------

```sh
npm start
```

Open browser on url [http://127.0.0.1:9500] and you can start organizing your day!


[node.js]:http://nodejs.org
[express]:http://expressjs.com
[MongoDB]:https://www.mongodb.org
[Angular.js]:http://angularjs.org
[Mongoose]:http://mongoosejs.com
[Mocha]:http://visionmedia.github.io/mocha
[http://127.0.0.1:9500]:http://127.0.0.1:9500
