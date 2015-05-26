'use strict'

controllersPath = '../controllers/'
routes = []
_ = require('underscore')

# function loginRoutes(server) {
#     var loginController = require(controllersPath + 'login-controller')(server);
#
#     _.each(loginController.routes, function (route) {
#         server.route(route);
#     });
# }

pageRoutes = (server) ->
  pageController = require(controllersPath + 'page-controller')(server)
  _.each pageController.routes, (route) ->
    server.route route
    return
  return

ResolveRoutes = (server) ->
  cors = server.settings.connections.routes.cors
  headers = [].concat(cors.headers).concat(cors.additionalHeaders)
  # favicon
  server.route
    method: 'GET'
    path: '/favicon.ico'
    handler: file: './favicon.ico'
    config: cache: expiresIn: 86400000
  # static serving support
  server.route
    method: 'GET'
    path: '/{param*}'
    handler: directory:
      path: './static'
      listing: false
      index: true
  # requried for angularjs preflight calls
  server.route
    method: 'OPTIONS'
    path: '/{param*}'
    handler: (request, reply) ->
      reply().type('text/plain').header('Access-Control-Allow-Origin', cors.origin.join(' ')).header 'Access-Control-Allow-Headers', headers.join(', ')
      return
  # loginRoutes(server);
  pageRoutes server
  routes

module.exports = ->
  _this = exports
  _this.resolveRoutes = ResolveRoutes
  _this
