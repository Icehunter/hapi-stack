'use strict';

var controllersPath = '../app/controllers/client/';
var routes = [];
var _ = require('underscore');

// function loginRoutes(server) {
//     var loginController = require(controllersPath + 'login-controller')(server);
//
//     _.each(loginController.routes, function (route) {
//         server.route(route);
//     });
// }

function pageRoutes(server) {
    var pageController = require(controllersPath + 'page-controller')(server);

    _.each(pageController.routes, function (route) {
        server.route(route);
    });
}

var ResolveRoutes = function (server) {
    var cors = server.settings.connections.routes.cors;
    var headers = [].concat(cors.headers).concat(cors.additionalHeaders);

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

    // static serving support
    server.route({
        method: '*',
        path: '/{param*}',
        handler: {
            directory: {
                path: './static',
                listing: false,
                index: true
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
                .header('Access-Control-Allow-Origin', cors.origin.join(' '))
                .header('Access-Control-Allow-Headers', headers.join(', '));
        }
    });

    // loginRoutes(server);
    pageRoutes(server);
    return routes;
};

module.exports = function () {
    var _this = exports;
    _this.resolveRoutes = ResolveRoutes;
    return _this;
};
