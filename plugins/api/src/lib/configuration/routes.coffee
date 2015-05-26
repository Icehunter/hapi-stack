'use strict'

controllersPath = '../controllers/'
routes = []
_ = require('underscore')

systemRoutes = (server) ->
  systemController = require(controllersPath + 'system-controller')(server)
  _.each systemController.routes, (route) ->
    server.route route
    return
  return

ResolveRoutes = (server) ->
  cors = server.settings.connections.routes.cors
  headers = [].concat(cors.headers).concat(cors.additionalHeaders)
  # favicon
  server.route
    method: 'GET'
    path: '/api/favicon.ico'
    handler: file: './favicon.ico'
    config: cache: expiresIn: 86400000
  # requried for angularjs preflight calls
  server.route
    method: 'OPTIONS'
    path: '/api/{param*}'
    handler: (request, reply) ->
      reply().type('text/plain').header('Access-Control-Allow-Origin', cors.origin.join(' ')).header 'Access-Control-Allow-Headers', headers.join(', ')
      return
  systemRoutes server
  routes

module.exports = ->
  _this = exports
  _this.resolveRoutes = ResolveRoutes
  _this
