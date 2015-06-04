'use strict';

var async = require('async');

exports.register = function (server, options, next) {
    server.setup = options.setup || {};
    async.series([
        function (cb) {
            server.path(__dirname);
            cb();
        },
        function (cb) {
            var io;
            io = require('socket.io')(server.listener);
            io.on('connection', function (socket) {
                console.log(socket);
            });
            cb();
        },
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
