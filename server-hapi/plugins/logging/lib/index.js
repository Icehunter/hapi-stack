'use strict';

// var internals = {};

exports.register = function (server, options, next) {
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
        next(err);
    });
};

exports.register.attributes = {
    pkg: require('../package.json')
};
