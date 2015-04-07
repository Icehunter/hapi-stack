'use strict';

var Splash = function (request, reply) {
    reply.view('pages/splash', {
        title: 'SPLASH'
    });
};

module.exports = function () {
    var _this = exports;
    _this.routes = [{
        method: 'GET',
        path: '/',
        config: {
            handler: Splash
        }
    }];
    return _this;
};
