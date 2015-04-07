'use strict';

var async = require('async');
var fs = require('fs');
var path = require('path');

module.exports = function (server, callback) {
    var connections = [];
    async.series([
        function (cb) {
            var connectionOptions = {
                host: process.env.API_HOST || 'localhost',
                port: process.env.API_PORT || 8000,
                labels: [
                    'api'
                ]
            };
            if (process.env.API_HTTPS === 'true') {
                connectionOptions.tls = {
                    key: fs.readFileSync(path.join(__dirname, './certificates/server.key')),
                    cert: fs.readFileSync(path.join(__dirname, './certificates/server.crt'))
                };
            }
            connections.push({
                key: connectionOptions.labels[0],
                connection: server.connection(connectionOptions)
            });
            cb();
        },
        function (cb) {
            var connectionOptions = {
                host: process.env.CLIENT_HOST || 'localhost',
                port: process.env.CLIENT_PORT || 3000,
                labels: [
                    'client'
                ]
            };
            if (process.env.CLIENT_HTTPS === 'true') {
                connectionOptions.tls = {
                    key: fs.readFileSync(path.join(__dirname, './certificates/client.key')),
                    cert: fs.readFileSync(path.join(__dirname, './certificates/client.crt'))
                };
            }
            connections.push({
                key: connectionOptions.labels[0],
                connection: server.connection(connectionOptions)
            });
            cb();
        },
        function (cb) {
            var connectionOptions = {
                host: process.env.SOCKETIO_HOST || 'localhost',
                port: process.env.SOCKETIO_PORT || 4000,
                labels: [
                    'socketio'
                ]
            };
            if (process.env.SOCKETIO_HTTPS === 'true') {
                connectionOptions.tls = {
                    key: fs.readFileSync(path.join(__dirname, './certificates/socketio.key')),
                    cert: fs.readFileSync(path.join(__dirname, './certificates/socketio.crt'))
                };
            }
            connections.push({
                key: connectionOptions.labels[0],
                connection: server.connection(connectionOptions)
            });
            cb();
        }
    ], function (err) {
        callback(err, connections);
    });
};
