'use strict';

var HTTPSignature = require('http-signature');
var async = require('async');

exports.register = function (server, options, next) {
    server.setup = options.setup || {};
    async.series([
        function (cb) {
            server.path(__dirname);
            cb();
        },
        function (cb) {
            server.register(require('hapi-auth-signature'), function (err) {
                var HMAC, RSA;
                if (err) {
                    next(err);
                }
                else {
                    HMAC = [{
                        id: 0,
                        username: 'monitor',
                        clientID: 'cbe70b09-5089-46c1-b04e-e933cb570b8d',
                        clientSecret: '164aefdd-ae33-47a3-ac23-7432f406e555'
                    }];
                    RSA = [];
                    async.series([
                        function (cb) {
                            server.auth.strategy('hmac', 'signature', {
                                validateFunc: function (request, parsedSignature, callback) {
                                    var keyId = parsedSignature.keyId;
                                    var credentials = {};
                                    var secretKey = void 0;
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
                            server.auth.strategy('rsa', 'signature', {
                                validateFunc: function (request, parsedSignature, callback) {
                                    var keyId = parsedSignature.keyId;
                                    var credentials = {};
                                    var secretKey = void 0;
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
                    ], function (err) {
                        cb(err);
                    });
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
