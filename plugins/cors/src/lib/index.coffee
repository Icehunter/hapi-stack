'use strict'
# var internals = {};
async = require('async')
util = require('util')
os = require('os')
_ = require('underscore')

exports.register = (server, options, next) ->
  server.setup = options.setup or {}
  async.series [
    (cb) ->
      server.path __dirname
      cb()
      return
    (cb) ->
      server.register require('scooter'), (err) ->
        cb err
        return
      return
    (cb) ->
      # default sources
      defaults = [
        'self'
        '*.bootstrapcdn.com'
        '*.google.com'
        '*.googleapis.com'
        '*.google.com'
        '*.googleapis.com'
        '*.gstatic.com'
        '*.gstatic.com'
        'unsafe-inline'
      ]
      connectSrc = defaults.slice(0).concat([
        util.format('ws://%s:*', os.hostname())
        'ws://localhost:*'
        'ws://127.0.0.1:*'
      ])
      if options.servers
        _.each options.servers, (connection) ->
          source = util.format('ws://%s:*', connection.domain)
          if !_.contains(connectSrc, connection)
            connectSrc.push source
          return
      server.register {
        register: require('blankie')
        options:
          connectSrc: connectSrc
          fontSrc: defaults.slice(0)
          scriptSrc: defaults.slice(0)
          styleSrc: defaults.slice(0)
          imgSrc: defaults.slice(0).concat([ 'data:' ])
      }, (err) ->
        cb err
        return
      return
  ], (err) ->
    next err
    return
  return

exports.register.attributes = pkg: require('../package.json')
