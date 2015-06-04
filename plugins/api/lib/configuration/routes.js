'use strict';

var controllersPath = '../controllers/';
var routes = [];
var _ = require('underscore');

function systemRoutes(server) {
    var systemController = require(controllersPath + 'system-controller')(server);
    _.each(systemController.routes, function (route) {
        server.route(route);
    });
}

var ResolveRoutes = function (server) {
    var cors = server.settings.connections.routes.cors;
    var headers = [].concat(cors.headers).concat(cors.additionalHeaders);
    server.route({
        method: 'GET',
        path: '/api/favicon.ico',
        handler: {
            file: './favicon.ico'
        },
        config: {
            cache: {
                expiresIn: 86400000
            }
        }
    });
    server.route({
        method: 'OPTIONS',
        path: '/api/{param*}',
        handler: function (request, reply) {
            reply().type('text/plain')
                .header('Access-Control-Allow-Origin', cors.origin.join(' '))
                .header('Access-Control-Allow-Headers', headers.join(', '));
        }
    });
    systemRoutes(server);
    return routes;
};

module.exports = function () {
    var _this = exports;
    _this.resolveRoutes = ResolveRoutes;
    return _this;
};
