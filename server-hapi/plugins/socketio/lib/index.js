'use strict';

// var internals = {};
var async = require('async');

exports.register = function (server, options, next) {
    async.series([
        // set plugin path for plugin
        function (cb) {
            server.path(__dirname);
            cb();
        },
        // register handlers
        function (cb) {
            // import handlers and setup basic socket.io connection
            var io = require('socket.io')(server.listener);
            io.on('connection', function (socket) {
                // you should setup your handlers here
                console.log(socket);
            });
            cb();
        },
        // register special routes
        function (cb) {
            require('./configuration/routes')().resolveRoutes(server);
            cb();
        }
    ], function (err) {
        next(err);
    });
};

exports.register.attributes = {
    pkg: require('../package.json')
};
