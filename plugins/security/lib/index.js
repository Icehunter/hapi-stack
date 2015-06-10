'use strict';

var HTTPSignature = require('http-signature');
var async = require('async');
var Bcrypt = require('bcrypt');

var internals = {
    HMAC: [{
        id: 0,
        username: 'monitor',
        clientID: 'cbe70b09-5089-46c1-b04e-e933cb570b8d',
        clientSecret: '164aefdd-ae33-47a3-ac23-7432f406e555'
    }],
    RSA: [],
    USERS: {
        icehunter: {
            username: 'icehunter',
            password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm', // 'secret'
            name: 'Icehunter',
            id: 'f29610c4-3809-41fe-8936-875b686809ff'
        }
    }
};

exports.register = function (server, options, next) {
    server.setup = options.setup || {};
    async.series([
        function (cb) {
            server.path(__dirname);
            cb();
        },
        function (cb) {
            server.register(require('hapi-auth-signature'), function (err) {
                if (err) {
                    next(err);
                }
                else {
                    async.series([
                        function (cb) {
                            server.auth.strategy('hmac', 'signature', {
                                validateFunc: function (request, parsedSignature, callback) {
                                    var keyId = parsedSignature.keyId;
                                    var credentials = {};
                                    var secretKey = void 0;
                                    internals.HMAC.forEach(function (user) {
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
                            server.auth.strategy('rsa', 'signature', {
                                validateFunc: function (request, parsedSignature, callback) {
                                    var keyId = parsedSignature.keyId;
                                    var credentials = {};
                                    var secretKey = void 0;
                                    internals.RSA.forEach(function (user) {
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
                    ], function (err) {
                        cb(err);
                    });
                }
            });
        },
        function (cb) {
            server.register(require('hapi-auth-basic'), function (err) {
                if (err) {
                    cb(err);
                }
                else {
                    server.auth.strategy('simple', 'basic', {
                        validateFunc: function (username, password, callback) {
                            var user = internals.USERS[username];
                            if (!user) {
                                return callback(null, false);
                            }
                            Bcrypt.compare(password, user.password, function (err, isValid) {
                                callback(err, isValid, {
                                    id: user.id,
                                    name: user.name
                                });
                            });
                        }
                    });
                    cb();
                }
            });
        }
    ], function (err) {
        next(err);
    });
};

exports.register.attributes = {
    pkg: require('../package.json')
};
