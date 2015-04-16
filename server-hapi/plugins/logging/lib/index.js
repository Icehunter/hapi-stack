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
        // setup registers
        function (cb) {
            server.register({
                register: require('good'),
                options: {
                    reporters: [{
                        reporter: require('good-file'),
                        args: ['./logs/ops.log', {
                            ops: '*'
                        }]
                    }, {
                        reporter: require('good-console'),
                        args: [{
                            log: '*',
                            response: '*',
                            error: '*'
                        }]
                    }, {
                        reporter: require('good-file'),
                        args: ['./logs/debug.log', {
                            log: 'debug'
                        }]
                    }, {
                        reporter: require('good-file'),
                        args: ['./logs/info.log', {
                            log: 'info'
                        }]
                    }, {
                        reporter: require('good-file'),
                        args: ['./logs/error.log', {
                            error: 'error'
                        }]
                    }]
                }
            }, function (err) {
                cb(err);
            });
        }
    ], function (err) {
        next(err);
    });
};

exports.register.attributes = {
    pkg: require('../package.json')
};
