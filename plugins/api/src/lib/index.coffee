'use strict'

pkg = require('../package.json')
internals = {}
async = require('async')

initalize = (server) ->
  internals.logger.log 'info', require('util').format('%s Initialized', server.setup.key.toUpperCase())
  return

exports.register = (server, options, next) ->
  server.setup = options.setup or {}
  async.series [
    (cb) ->
      server.path __dirname
      cb()
      return
    (cb) ->
      internals.logger =
        log: (tags, data) ->
          server.log tags,
            module: pkg.name
            data: data
          return
        error: (tags, data) ->
          server.error tags,
            module: pkg.name
            data: data
          return
      cb()
      return
    (cb) ->
      async.whilst (->
        server.info.started == 0
      ), ((cb) ->
        setTimeout cb, 500
        return
      ), ->
        initalize server
        return
      cb()
      return
    (cb) ->
      server.register {
        register: require('lout')
        options: endpoint: '/api'
      }, (err) ->
        cb err
        return
      return
    (cb) ->
      server.register {
        register: require('tv')
        options:
          host: process.env.API_DOMAIN
          endpoint: '/api/console'
      }, (err) ->
        cb err
        return
      return
    (cb) ->
      require('./configuration/routes')().resolveRoutes server
      cb()
      return
  ], (err) ->
    next err
    return
  return

exports.register.attributes = pkg: pkg
