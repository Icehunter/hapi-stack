'use strict';

var Hapi = require('hapi');

// third party imports
var fs = require('fs');
var os = require("os");
var util = require('util');
var path = require('path');
var HTTPSignature = require('http-signature');
var async = require('async');

// internal modules
var formatters = require('./app/helpers/formatters')();

var server;

function handleConfiguration(env) {
    for (var key in env) {
        process.env[key] = env[key];
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
    // setup conection options and apply TLS if required
    function (cb) {
        var connectionOptions = {
            host: process.env.HOST || 'localhost',
            port: process.env.PORT || 8000
        };
        if (process.env.HTTPS === 'true') {
            connectionOptions.tls = {
                key: fs.readFileSync(path.join(__dirname, './certificates/server.key')),
                cert: fs.readFileSync(path.join(__dirname, './certificates/server.crt'))
            };
        }
        server = new Hapi.Server({
            connections: {
                router: {
                    isCaseSensitive: false,
                    stripTrailingSlash: true
                },
                routes: {
                    cors: {
                        origin: [
                            os.hostname(),
                            process.env.DOMAIN,
                            'localhost',
                            '127.0.0.1'
                        ],
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
        server.connection(connectionOptions);
        cb();
    },
    // setup server error handlers
    function (cb) {
        function handleError(err, fatal) {
            var error = formatters.formatError(err);
            server.log('error', error);
            if (fatal) {
                process.exit(1);
            }
        }

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
    // register api documentation
    function (cb) {
        server.register({
            register: require('lout'),
            options: {
                endpoint: '/api/docs'
            }
        }, function (err) {
            cb(err);
        });
    },
    // register server console Web UI
    function (cb) {
        server.register({
            register: require('tv'),
            options: {
                host: process.env.DOMAIN,
                endpoint: '/api/console'
            }
        }, function (err) {
            cb(err);
        });
    },
    // setup loggers
    function (cb) {
        server.register({
            register: require('good'),
            options: {
                opsInterval: 1000,
                reporters: [{
                    reporter: require('good-console'),
                    args: [{
                        log: '*',
                        response: '*',
                        error: '*'
                    }]
                }, {
                    reporter: require('good-file'),
                    args: [
                        './logs/debug.log', {
                            log: 'debug'
                        }
                    ]
                }, {
                    reporter: require('good-file'),
                    args: [
                        './logs/info.log', {
                            log: 'info'
                        }
                    ]
                }, {
                    reporter: require('good-file'),
                    args: [
                        './logs/errors.log', {
                            error: 'error'
                        }
                    ]
                }]
            }
        }, function (err) {
            cb(err);
        });
    },
    // register superagent plugin
    function (cb) {
        server.register(require('scooter'), function (err) {
            cb(err);
        });
    },
    // register proctection of cross domain scripts/sources
    function (cb) {
        // default sources
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
        server.register({
            register: require('blankie'),
            options: {
                connectSrc: defaults.slice(0).concat([
                    util.format('ws://%s:*', os.hostname()),
                    util.format('ws://%s:*', process.env.DOMAIN),
                    'ws://localhost:*',
                    'ws://127.0.0.1:*'
                ]),
                fontSrc: defaults.slice(0),
                scriptSrc: defaults.slice(0),
                styleSrc: defaults.slice(0),
                imgSrc: defaults.slice(0).concat([
                    'data:'
                ])
            }
        }, function (err) {
            cb(err);
        });
    },
    // register api protection schemas
    function (cb) {
        server.register(require('hapi-auth-signature'), function (err) {
            if (err) {
                cb(err);
            }
            else {
                var HMAC = [{
                    id: 0,
                    username: 'monitor',
                    clientID: 'cbe70b09-5089-46c1-b04e-e933cb570b8d',
                    clientSecret: '164aefdd-ae33-47a3-ac23-7432f406e555'
                }];
                var RSA = [];
                async.series([
                    function () {
                        server.auth.strategy('hmac', 'signature', {
                            validateFunc: function (request, parsedSignature, callback) {
                                var keyId = parsedSignature.keyId;
                                var credentials = {};
                                var secretKey;
                                // api users should be loaded from the database and cached
                                HMAC.forEach(function (user) {
                                    if (user.clientID === keyId) {
                                        secretKey = user.clientSecret;
                                        credentials = {
                                            id: user.id,
                                            username: user.username
                                        };
                                    }
                                });
                                if (!secretKey) {
                                    callback(null, false);
                                }
                                else {
                                    if (HTTPSignature.verifySignature(parsedSignature, secretKey)) {
                                        callback(null, true, credentials);
                                    }
                                    else {
                                        callback(null, false);
                                    }
                                }
                            }
                        });
                        cb();
                    },
                    function () {
                        server.auth.strategy('hmac', 'signature', {
                            validateFunc: function (request, parsedSignature, callback) {
                                var keyId = parsedSignature.keyId;
                                var credentials = {};
                                var secretKey;
                                // api users should be loaded from the database and cached
                                RSA.forEach(function (user) {
                                    if (user.clientID === keyId) {
                                        secretKey = user.clientSecret;
                                        credentials = {
                                            id: user.id,
                                            username: user.username
                                        };
                                    }
                                });
                                if (!secretKey) {
                                    callback(null, false);
                                }
                                else {
                                    if (HTTPSignature.verifySignature(parsedSignature, secretKey)) {
                                        callback(null, true, credentials);
                                    }
                                    else {
                                        callback(null, false);
                                    }
                                }
                            }
                        });
                        cb();
                    }
                ], function () {
                    cb();
                });
            }
        });
    },
    // if using social signin remove cb() and uncomment this and loginRoutess() in configuratin/routes.js
    function (cb) {
        cb();
        // server.register(require('bell'), function (err) {
        //     if (err) {
        //         cb(err);
        //     }
        //     else {
        //         var socialSites = require('./social')(server);
        //         var counter = 0;
        //         async.whilst(function () {
        //                 return counter < socialSites.length;
        //             },
        //             function (callback) {
        //                 var site = socialSites[counter];
        //                 server.auth.strategy(site.provider, 'bell', site);
        //                 counter++;
        //                 callback();
        //             },
        //             function (err) {
        //                 cb(err);
        //             });
        //     }
        // });
    },
    // resolve routes
    function (cb) {
        require('./configuration/routes')().resolveRoutes(server);
        cb();
    }
], function (err) {
    if (err) {
        console.log(err.message || err || 'UNKNOWN_ERROR');
        process.exit(1);
    }
    else {
        // startem up the shields!!!
        server.start(function () {
            server.log('info', 'Server Listening @ Port: ' + server.info.port + ' [' + (process.env.NODE_ENV || 'development') + ']');
        });
    }
});
