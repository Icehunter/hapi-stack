'use strict';

var internals = {};

var async = require('async');
var path = require('path');
var fs = require('fs');
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
            var dust = require('dustjs-linkedin');
            fs.readFile(path.join(__dirname, './views/views.server.compiled'), function (err, source) {
                if (err) {
                    cb(err);
                }
                else {
                    dust.loadSource(source);
                    cb();
                }
            });
        },
        function (cb) {
            var caching = process.env.NODE_ENV === 'production' ? true : false;
            var engine = require('hapi-dust');
            server.views({
                defaultExtension: 'dust',
                engines: {
                    dust: engine
                },
                isCached: caching,
                layoutPath: path.join(__dirname, './views/layouts'),
                partialsPath: path.join(__dirname, './views/partials'),
                path: path.join(__dirname, './views/pages'),
                relativeTo: __dirname
            });
            cb();
        },
        function (cb) {
            server.register(require('bell'), function (err) {
                if (err) {
                    cb(err);
                }
                else {
                    var socialSites = [];
                    var counter = 0;
                    async.whilst((function () {
                        return counter < socialSites.length;
                    }), (function (callback) {
                        var site = socialSites[counter];
                        server.auth.strategy(site.provider, 'bell', site);
                        counter++;
                        callback();
                    }), function (err) {
                        cb(err);
                    });
                }
            });
        },
        function (cb) {
            require('./configuration/routes')().resolveRoutes(server);
            cb();
        },
        function (cb) {
            server.ext('onPreResponse', function (request, reply) {
                var response = request.response;
                if (response.isBoom) {
                    var error = response;
                    reply.view('error', {
                        message: error.message
                    });
                }
                else {
                    reply['continue']();
                }
            });
            cb();
        }
    ], function (err) {
        next(err);
    });
};

exports.register.attributes = {
    pkg: pkg
};
