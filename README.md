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
* [Redis] - key-value store with fast performance

Prerequesite
------------

You need [node.js] running on your machine.
For persistence, this app needs a [MongoDB] server and a [Redis] server.

Installation
--------------

```sh
git clone [git-repo-url] todoapp
cd todoapp
sudo npm install -g bower
sudo npm install -g bunyan
sudo bower install
sudo npm install
```

Testing
--------------
All components have unit test.

```sh
npm test
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
[Redis]:http://redis.io
