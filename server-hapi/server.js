'use strict';

var Hapi = require('hapi');
var fs = require('fs');
var os = require('os');
var util = require('util');
var path = require('path');
var async = require('async');
var _ = require('underscore');
var formatters = require('./app/helpers/formatters')();
var server = void 0;
var configuration = {};

function handleConfiguration(env) {
    var key;
    for (key in env) {
        process.env[key] = JSON.stringify(env[key]);
    }
}

function handleError(err, fatal) {
    var error = formatters.formatError(err);
    server.log('error', error);
    if (fatal) {
        process.exit(1);
    }
}

async.series([
    function (cb) {
        fs.exists(path.join(__dirname, './configuration/env.json'), function (exists) {
            if (exists) {
                require('reloadable-env')({
                    envPath: path.join(__dirname, './configuration/env.json')
                }, {
                    configured: function (env) {
                        handleConfiguration(env);
                        cb();
                    },
                    reconfigured: function (env) {
                        handleConfiguration(env);
                    },
                    error: function () {}
                });
            }
            else {
                cb(new Error('./configuration/env.json does not exist.'));
            }
        });
    },
    function (cb) {
        configuration.servers = [];
        try {
            var servers = JSON.parse(process.env.SERVERS);
            _.each(servers, function (connection) {
                configuration.servers.push(connection);
            });
            cb();
        }
        catch (_error) {
            var err = _error;
            cb(err);
        }
    },
    function (cb) {
        configuration.plugins = [];
        try {
            var plugins = JSON.parse(process.env.PLUGINS);
            _.each(plugins, function (plugin) {
                configuration.plugins.push(plugin);
            });
            cb();
        }
        catch (_error) {
            var err = _error;
            cb(err);
        }
    },
    function (cb) {
        var origin = [
            os.hostname(),
            'localhost',
            '127.0.0.1'
        ];
        _.each(configuration.servers, function (connection) {
            if (!_.contains(origin, connection.domain)) {
                origin.push(connection.domain);
            }
        });
        module.exports = server = new Hapi.Server({
            connections: {
                router: {
                    isCaseSensitive: false,
                    stripTrailingSlash: true
                },
                routes: {
                    cors: {
                        origin: origin,
                        additionalHeaders: [
                            'X-Requested-With',
                            'token'
                        ],
                        credentials: true
                    },
                    security: {
                        xframe: false
                    },
                    files: {
                        relativeTo: __dirname
                    }
                }
            }
        });
        cb();
    },
    function (cb) {
        server.on('internalError', function (request, err) {
            handleError(err);
        });
        process.on('uncaughtException', function (err) {
            handleError(err, true);
        });
        process.on('SIGTERM', function () {
            server.log('info', 'Server Shutting Down');
        });
        cb();
    },
    // LOAD CONNECTIONS
    function (cb) {
        var index = 0;
        var servers = configuration.servers;
        async.whilst((function () {
            return index < servers.length;
        }), (function (cb) {
            var connection, connectionOptions;
            connection = servers[index];
            connectionOptions = {
                host: connection.host,
                port: connection.port,
                labels: [connection.key]
            };
            if (connection.https) {
                connectionOptions.tls = {
                    key: fs.readFileSync(util.format('%s/%s.key', connection.certificatesPath, connection.key)),
                    cert: fs.readFileSync(util.format('%s/%s.crt', connection.certificatesPath, connection.key))
                };
            }
            server.connection(connectionOptions).register({
                register: require(connection.key),
                select: [connection.key],
                options: {
                    setup: connection
                }
            }, function (err) {
                index++;
                cb(err);
            });
        }), function (err) {
            cb(err);
        });
    },
    // LOAD GLOBAL PLUGINS
    function (cb) {
        try {
            var index = 0;
            var plugins = configuration.plugins;
            async.whilst((function () {
                return index < plugins.length;
            }), (function (cb) {
                server.register(require(plugins[index]), function (err) {
                    index++;
                    cb(err);
                });
            }), function (err) {
                cb(err);
            });
        }
        catch (_error) {
            var err = _error;
            cb(err);
        }
    }
], function (err) {
    if (err) {
        console.log(err.message || err || 'UNKNOWN_ERROR');
        process.exit(1);
    }
    else {
        server.start(function () {
            var connection, index, key;
            for (index in server.connections) {
                connection = server.connections[index];
                key = connection.settings.labels[0];
                server.log('info', util.format('%s Listening [%s:%s]', key.toUpperCase(), process.env.NODE_ENV || 'development', connection.info.port));
            }
            server.log('info', 'SERVER Initialized');
        });
    }
});
