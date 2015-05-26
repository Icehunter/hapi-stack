'use strict'

Splash = (request, reply) ->
  reply.view 'splash', title: 'SPLASH'
  return

module.exports = ->
  _this = exports
  _this.routes = [ {
    method: 'GET'
    path: '/'
    config: handler: Splash
  } ]
  _this
