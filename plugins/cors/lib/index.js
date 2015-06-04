'use strict';

var async = require('async');
var util = require('util');
var os = require('os');
var _ = require('underscore');

exports.register = function (server, options, next) {
    server.setup = options.setup || {};
    async.series([
        function (cb) {
            server.path(__dirname);
            cb();
        },
        function (cb) {
            server.register(require('scooter'), function (err) {
                cb(err);
            });
        },
        function (cb) {
            var defaults = [
                'self',
                '*.bootstrapcdn.com',
                '*.google.com',
                '*.googleapis.com',
                '*.google.com',
                '*.googleapis.com',
                '*.gstatic.com',
                '*.gstatic.com',
                'unsafe-inline'
            ];
            var connectSrc = defaults.slice(0).concat([
                util.format('ws://%s:*', os.hostname()),
                'ws://localhost:*',
                'ws://127.0.0.1:*'
            ]);
            if (options.servers) {
                _.each(options.servers, function (connection) {
                    var source = util.format('ws://%s:*', connection.domain);
                    if (!_.contains(connectSrc, connection)) {
                        connectSrc.push(source);
                    }
                });
            }
            server.register({
                register: require('blankie'),
                options: {
                    connectSrc: connectSrc,
                    fontSrc: defaults.slice(0),
                    scriptSrc: defaults.slice(0),
                    styleSrc: defaults.slice(0),
                    imgSrc: defaults.slice(0).concat(['data:'])
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
