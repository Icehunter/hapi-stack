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
            server.register({
                register: require('good'),
                options: {
                    reporters: [{
                        reporter: require('good-file'),
                        events: {
                            ops: '*'
                        },
                        config: './logs/ops.log'
                    }, {
                        reporter: require('good-console'),
                        events: {
                            log: '*',
                            response: '*',
                            error: '*'
                        }
                    }, {
                        reporter: require('good-file'),
                        events: {
                            log: 'debug'
                        },
                        config: './logs/debug.log'
                    }, {
                        reporter: require('good-file'),
                        events: {
                            log: 'info'
                        },
                        config: './logs/info.log'
                    }, {
                        reporter: require('good-file'),
                        events: {
                            error: 'error'
                        },
                        config: './logs/error.log'
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
