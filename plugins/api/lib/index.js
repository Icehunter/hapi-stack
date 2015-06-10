'use strict';

var internals = {};

var async = require('async');
var pkg = require('../package.json');

function initialize(server) {
    internals.logger.log('info', require('util').format('%s Initialized', server.setup.key.toUpperCase()));
}

exports.register = function (server, options, next) {
    server.setup = options.setup || {};
    async.series([
        function (cb) {
            server.path(__dirname);
            cb();
        },
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
        function (cb) {
            async.whilst((function () {
                return server.info.started === 0;
            }), (function (cb) {
                setTimeout(cb, 500);
            }), function () {
                initialize(server);
            });
            cb();
        },
        function (cb) {
            server.register({
                register: require('server-hapi-security')
            }, function (err) {
                cb(err);
            });
        },
        function (cb) {
            server.register({
                register: require('hapi-swagger'),
                options: {
                    apiVersion: pkg.version,
                    endpoint: '/api/docs',
                    documentationPath: '/api'
                }
            }, function (err) {
                cb(err);
            });
        },
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
