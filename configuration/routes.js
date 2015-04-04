'use strict';

var controllersPath = '../app/controllers/';
var routes = [];
var _ = require('underscore');

function loginRoutes(server) {
    var loginController = require(controllersPath + 'login-controller')(server);

    _.each(loginController.routes, function (route) {
        server.route(route);
    });
}

function systemRoutes(server) {
    var systemController = require(controllersPath + 'system-controller')(server);

    _.each(systemController.routes, function (route) {
        server.route(route);
    });
}

var ResolveRoutes = function (server) {
    // favicon
    server.route({
        method: 'GET',
        path: '/favicon.ico',
        handler: {
            file: './favicon.ico'
        },
        config: {
            cache: {
                expiresIn: 86400000
            }
        }
    });

    // spa support
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: './static'
            }
        }
    });

    // requried for angularjs preflight calls
    server.route({
        method: 'OPTIONS',
        path: '/{param*}',
        handler: function (request, reply) {
            reply()
                .type('text/plain')
                .header('Access-Control-Allow-Origin', '*')
                .header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, token');
        }
    });

    // loginRoutes(server);
    systemRoutes(server);
    return routes;
};

module.exports = function () {
    var _this = exports;
    _this.resolveRoutes = ResolveRoutes;
    return _this;
};
