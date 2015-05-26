'use strict'

controllersPath = '../controllers/'
routes = []
_ = require('underscore')

socketIORoutes = (server) ->
  pageController = require(controllersPath + 'socket-controller')(server)
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
    path: '/socket.io/favicon.ico'
    handler: file: './favicon.ico'
    config: cache: expiresIn: 86400000
  # static serving support
  server.route
    method: '*'
    path: '/socket.io/{param*}'
    handler: directory:
      path: './static'
      listing: false
      index: true
  # requried for angularjs preflight calls
  server.route
    method: 'OPTIONS'
    path: '/socket.io/{param*}'
    handler: (request, reply) ->
      reply().type('text/plain').header('Access-Control-Allow-Origin', cors.origin.join(' ')).header 'Access-Control-Allow-Headers', headers.join(', ')
      return
  socketIORoutes server
  routes

module.exports = ->
  _this = exports
  _this.resolveRoutes = ResolveRoutes
  _this
