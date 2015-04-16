'use strict';

// var internals = {};
var async = require('async');

exports.register = function (server, options, next) {
    server.setup = options.setup || {};
    async.series([
        // set plugin path for plugin
        function (cb) {
            server.path(__dirname);
            cb();
        },
        // register api documentation
        function (cb) {
            server.register({
                register: require('lout'),
                options: {
                    endpoint: '/api'
                }
            }, function (err) {
                cb(err);
            });
        },
        // register api console Web UI
        function (cb) {
            server.register({
                register: require('tv'),
                options: {
                    host: process.env.API_DOMAIN,
                    endpoint: '/api/console'
                }
            }, function (err) {
                cb(err);
            });
        },
        // register routes
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
