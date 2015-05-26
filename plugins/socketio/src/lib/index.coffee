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
      # import handlers and setup basic socket.io connection
      io = require('socket.io')(server.listener)
      io.on 'connection', (socket) ->
        # you should setup your handlers here
        console.log socket
        return
      cb()
      return
    (cb) ->
      require('./configuration/routes')().resolveRoutes server
      cb()
      return
  ], (err) ->
    next err
    return
  return

exports.register.attributes = pkg: require('../package.json')
