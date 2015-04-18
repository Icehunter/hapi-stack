'use strict';

var pkg = require('../package.json');

var internals = {};
var async = require('async');

function initalize(server) {
    internals.logger.log('info', require('util').format('%s Initialized', server.setup.key.toUpperCase()));
}

exports.register = function (server, options, next) {
    server.setup = options.setup || {};
    async.series([
        // set plugin path for plugin
        function (cb) {
            server.path(__dirname);
            cb();
        },
        // setup namespaced loggers
        function (cb) {
            internals.logger = {
                log: function (tags, data) {
                    server.log(tags, {
                        module: pkg.name,
                        data: data
                    });
                },
                error: function (tags, data) {
                    server.error(tags, {
                        module: pkg.name,
                        data: data
                    });
                }
            };
            cb();
        },
        // handle post listen initialization
        function (cb) {
            async.whilst(
                function () {
                    return server.info.started === 0;
                },
                function (cb) {
                    setTimeout(cb, 500);
                },
                function () {
                    initalize(server);
                });
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
    pkg: pkg
};
