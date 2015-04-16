'use strict';

var Hapi = require('hapi');

// third party imports
var fs = require('fs');
var os = require("os");
var util = require('util');
var path = require('path');
var async = require('async');
var _ = require('underscore');

// internal modules
var formatters = require('./app/helpers/formatters')();
var server;
var configuration = {};

function handleConfiguration(env) {
    for (var key in env) {
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
    // setup ENV watcher from file and monitor changes
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
    // load server config from env
    function (cb) {
        configuration.servers = [];
        try {
            var servers = JSON.parse(process.env.SERVERS);
            _.each(servers, function (connection) {
                configuration.servers.push(connection);
            });
            cb();
        }
        catch (err) {
            cb(err);
        }
    },
    // load plugin config from env
    function (cb) {
        configuration.plugins = [];
        try {
            var plugins = JSON.parse(process.env.PLUGINS);
            _.each(plugins, function (plugin) {
                configuration.plugins.push(plugin);
            });
            cb();
        }
        catch (err) {
            cb(err);
        }
    },
    // setup conection options and apply TLS if required for API and CLIENT, SOCKETS
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
                        additionalHeaders: ['X-Requested-With', 'token'],
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
    // setup server error handlers
    function (cb) {

        server.on('internalError', function (request, err) {
            handleError(err);
            // if you want for format an error with html rather than JSON you can override:
            // request.response.output.payload
            // default is object.
            // statusCode is in request.response.output.statusCode
            // sample:
            // var response = {
            //     name: 'JsonWebTokenError',
            //     message: 'invalid signature',
            //     isBoom: true,
            //     data: null,
            //     output: {
            //         statusCode: 500,
            //         payload: {
            //             statusCode: 500,
            //             error: 'Internal Server Error',
            //             message: 'An internal server error occurred'
            //         },
            //         headers: {}
            //     }
            // };
        });

        process.on('uncaughtException', function (err) {
            handleError(err, true);
        });

        process.on('SIGTERM', function () {
            server.log('info', 'Server Shutting Down');
        });
        cb();
    },
    // setup connections and connection plugins
    function (cb) {
        var index = 0;
        var servers = configuration.servers;
        async.whilst(
            function () {
                return index < servers.length;
            },
            function (cb) {
                var connection = servers[index];
                var connectionOptions = {
                    host: connection.host,
                    port: connection.port,
                    labels: [
                        connection.key
                    ]
                };
                if (connection.https) {
                    connectionOptions.tls = {
                        key: fs.readFileSync(util.format('%s/%s.key', connection.certificatesPath, connection.key)),
                        cert: fs.readFileSync(util.format('%s/%s.crt', connection.certificatesPath, connection.key))
                    };
                }
                server.connection(connectionOptions).register({
                    register: require('./plugins/' + connection.key),
                    select: [
                        connection.key
                    ],
                    options: {
                        config: connection.config || {}
                    }
                }, function (err) {
                    index++;
                    cb(err);
                });
            },
            function (err) {
                cb(err);
            });
    },
    // register plugins
    function (cb) {
        try {
            var index = 0;
            var plugins = configuration.plugins;
            async.whilst(
                function () {
                    return index < plugins.length;
                },
                function (cb) {
                    server.register(require('./plugins/' + plugins[index]), function (err) {
                        index++;
                        cb(err);
                    });
                },
                function (err) {
                    cb(err);
                });
        }
        catch (err) {
            cb(err);
        }
    }
], function (err) {
    if (err) {
        console.log(err.message || err || 'UNKNOWN_ERROR');
        process.exit(1);
    }
    else {
        // startem up the shields!!!
        server.start(function () {
            for (var index in server.connections) {
                var connection = server.connections[index];
                var key = connection.settings.labels[0];
                server.log('info', util.format('%s Listening [%s:%s]', key.toUpperCase(), process.env.NODE_ENV || 'development', connection.info.port));
            }
            server.log('info', 'SERVER Initialized');
        });
    }
});
