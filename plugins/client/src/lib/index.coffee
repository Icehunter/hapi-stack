'use strict'

initalize = (server) ->
  internals.logger.log 'info', require('util').format('%s Initialized', server.setup.key.toUpperCase())
  return

pkg = require('../package.json')
internals = {}
async = require('async')
path = require('path')
fs = require('fs')

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
      dust = require('dustjs-linkedin')
      fs.readFile path.join(__dirname, './views/views.server.compiled'), (err, source) ->
        if err
          cb err
        else
          dust.loadSource source
          cb()
        return
      return
    (cb) ->
      caching = if process.env.NODE_ENV == 'production' then true else false
      engine = require('hapi-dust')
      server.views
        defaultExtension: 'dust'
        engines: dust: engine
        isCached: caching
        layoutPath: path.join(__dirname, './views/layouts')
        partialsPath: path.join(__dirname, './views/partials')
        path: path.join(__dirname, './views/pages')
        relativeTo: __dirname
      cb()
      return
    (cb) ->
      server.register require('bell'), (err) ->
        if err
          cb err
        else
          # var socialSites = require('./social')(server);
          socialSites = []
          counter = 0
          async.whilst (->
            counter < socialSites.length
          ), ((callback) ->
            site = socialSites[counter]
            server.auth.strategy site.provider, 'bell', site
            counter++
            callback()
            return
          ), (err) ->
            cb err
            return
        return
      return
    (cb) ->
      require('./configuration/routes')().resolveRoutes server
      cb()
      return
    (cb) ->
      server.ext 'onPreResponse', (request, reply) ->
        response = request.response
        if response.isBoom
          error = response
          reply.view 'error', message: error.message
        else
          reply['continue']()
        return
      cb()
      return
  ], (err) ->
    next err
    return
  return

exports.register.attributes = pkg: pkg
