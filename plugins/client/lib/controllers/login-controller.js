'use strict';

var TwitterLogin = function (request, reply) {
    reply.redirect('/');
};

var GoogleLogin = function (request, reply) {
    reply.redirect('/');
};

module.exports = function () {
    var _this = exports;
    _this.routes = [{
        method: [
            'GET',
            'POST'
        ],
        path: '/login/twitter',
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
        ],
        path: '/login/google',
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
