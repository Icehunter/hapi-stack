'use strict';

var TwitterLogin = function (request, reply) {
    // Perform any account lookup or registration, setup local session,
    // and redirect to the application. The third-party credentials are
    // stored in request.auth.credentials. Any query parameters from
    // the initial request are passed back via request.auth.credentials.query.
    reply.redirect('/');
};

var GoogleLogin = function (request, reply) {
    // Perform any account lookup or registration, setup local session,
    // and redirect to the application. The third-party credentials are
    // stored in request.auth.credentials. Any query parameters from
    // the initial request are passed back via request.auth.credentials.query.
    reply.redirect('/');
};

module.exports = function () {
    var _this = exports;
    _this.routes = [{
        method: [
            'GET',
            'POST'
        ], // Must handle both GET and POST
        path: '/api/login/twitter', // The callback endpoint registered with the provider
        config: {
            auth: {
                strategies: [
                    'twitter'
                ]
            },
            handler: TwitterLogin
        }
    }, {
        method: [
            'GET',
            'POST'
        ], // Must handle both GET and POST
        path: '/api/login/google', // The callback endpoint registered with the provider
        config: {
            auth: {
                strategies: [
                    'google'
                ]
            },
            handler: GoogleLogin
        }
    }];
    return _this;
};
