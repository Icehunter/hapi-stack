'use strict'
# var internals = {};
async = require('async')

exports.register = (server, options, next) ->
  server.setup = options.setup or {}
  async.series [
    (cb) ->
      server.path __dirname
      cb()
      return
    (cb) ->
      server.register {
        register: require('good')
        options: reporters: [
          {
            reporter: require('good-file')
            events: ops: '*'
            config: './logs/ops.log'
          }
          {
            reporter: require('good-console')
            events:
              log: '*'
              response: '*'
              error: '*'
          }
          {
            reporter: require('good-file')
            events: log: 'debug'
            config: './logs/debug.log'
          }
          {
            reporter: require('good-file')
            events: log: 'info'
            config: './logs/info.log'
          }
          {
            reporter: require('good-file')
            events: error: 'error'
            config: './logs/error.log'
          }
        ]
      }, (err) ->
        cb err
        return
      return
  ], (err) ->
    next err
    return
  return

exports.register.attributes = pkg: require('../package.json')
