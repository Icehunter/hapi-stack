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

var SERVER;
var API;
var CLIENT;

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
    // setup conection options and apply TLS if required for API and CLIENT
    function (cb) {
        SERVER = new Hapi.Server({
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
        async.series([
            function (cb) {
                var connectionOptions = {
                    host: process.env.API_HOST || 'localhost',
                    port: process.env.API_PORT || 8000
                };
                if (process.env.API_HTTPS === 'true') {
                    connectionOptions.tls = {
                        key: fs.readFileSync(path.join(__dirname, './certificates/SERVER.key')),
                        cert: fs.readFileSync(path.join(__dirname, './certificates/SERVER.crt'))
                    };
                }
                API = SERVER.connection(connectionOptions);
                cb();
            },
            function (cb) {
                var connectionOptions = {
                    host: process.env.CLIENT_HOST || 'localhost',
                    port: process.env.CLIENT_PORT || 3000
                };
                if (process.env.CLIENT_HTTPS === 'true') {
                    connectionOptions.tls = {
                        key: fs.readFileSync(path.join(__dirname, './certificates/client.key')),
                        cert: fs.readFileSync(path.join(__dirname, './certificates/client.crt'))
                    };
                }
                CLIENT = SERVER.connection(connectionOptions);

                var caching = (process.env.NODE_ENV === 'production') ? true : false;
                var engineOptions = {
                    caching: caching
                };
                var engine = require('hapijs-react-views')(engineOptions);

                CLIENT.views({
                    defaultExtension: 'jsx',
                    engines: {
                        jsx: engine,
                        js: engine
                    },
                    isCached: caching,
                    path: path.join(__dirname, './views'),
                    relativeTo: __dirname
                });
                cb();
            }
        ], function (err) {
            cb(err);
        });
    },
    // setup SERVER error handlers
    function (cb) {
        function handleError(err, fatal) {
            var error = formatters.formatError(err);
            SERVER.log('error', error);
            if (fatal) {
                process.exit(1);
            }
        }

        SERVER.on('internalError', function (request, err) {
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
            //             message: 'An internal SERVER error occurred'
            //         },
            //         headers: {}
            //     }
            // };
        });

        process.on('uncaughtException', function (err) {
            handleError(err, true);
        });

        process.on('SIGTERM', function () {
            SERVER.log('info', 'Server Shutting Down');
        });
        cb();
    },
    // register api documentation
    function (cb) {
        API.register({
            register: require('lout'),
            options: {
                endpoint: '/api'
            }
        }, function (err) {
            cb(err);
        });
    },
    // register SERVER console Web UI
    function (cb) {
        API.register({
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
        SERVER.register({
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
    },
    // register superagent plugin
    function (cb) {
        SERVER.register(require('scooter'), function (err) {
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
        SERVER.register({
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
        SERVER.register(require('hapi-auth-signature'), function (err) {
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
                    function (cb) {
                        SERVER.auth.strategy('hmac', 'signature', {
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
                    function (cb) {
                        SERVER.auth.strategy('rsa', 'signature', {
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
    // function (cb) {
    //     CLIENT.register(require('bell'), function (err) {
    //         if (err) {
    //             cb(err);
    //         }
    //         else {
    //             var socialSites = require('./social')(SERVER);
    //             var counter = 0;
    //             async.whilst(function () {
    //                     return counter < socialSites.length;
    //                 },
    //                 function (callback) {
    //                     var site = socialSites[counter];
    //                     CLIENT.auth.strategy(site.provider, 'bell', site);
    //                     counter++;
    //                     callback();
    //                 },
    //                 function (err) {
    //                     cb(err);
    //                 });
    //         }
    //     });
    // },
    // resolve routes
    function (cb) {
        require('./configuration/routes-api')().resolveRoutes(API);
        require('./configuration/routes-client')().resolveRoutes(CLIENT);
        cb();
    }
], function (err) {
    if (err) {
        console.log(err.message || err || 'UNKNOWN_ERROR');
        process.exit(1);
    }
    else {
        // startem up the shields!!!
        var ENV = process.env.NODE_ENV || 'development';
        SERVER.start(function () {
            SERVER.log('info', util.format('SERVER Listening [%s:%s]', ENV, SERVER.info.port));
            API.log('info', util.format('API Server Listening [%s:%s]', ENV, API.info.port));
            CLIENT.log('info', util.format('CLIENT Server Listening [%s:%s]', ENV, CLIENT.info.port));
        });
    }
});
