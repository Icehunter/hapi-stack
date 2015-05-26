'use strict'

Hapi = require('hapi')
# third party imports
fs = require('fs')
os = require('os')
util = require('util')
path = require('path')
async = require('async')
_ = require('underscore')

handleConfiguration = (env) ->
  for key of env
    process.env[key] = JSON.stringify(env[key])
  return

handleError = (err, fatal) ->
  error = formatters.formatError(err)
  server.log 'error', error
  if fatal
    process.exit 1
  return

# internal modules
formatters = require('./app/helpers/formatters')()
server = undefined
configuration = {}

async.series [
  (cb) ->
    fs.exists path.join(__dirname, './configuration/env.json'), (exists) ->
      if exists
        require('reloadable-env') { envPath: path.join(__dirname, './configuration/env.json') },
          configured: (env) ->
            handleConfiguration env
            cb()
            return
          reconfigured: (env) ->
            handleConfiguration env
            return
          error: ->
      else
        cb new Error('./configuration/env.json does not exist.')
      return
    return
  (cb) ->
    configuration.servers = []
    try
      servers = JSON.parse(process.env.SERVERS)
      _.each servers, (connection) ->
        configuration.servers.push connection
        return
      cb()
    catch err
      cb err
    return
  (cb) ->
    configuration.plugins = []
    try
      plugins = JSON.parse(process.env.PLUGINS)
      _.each plugins, (plugin) ->
        configuration.plugins.push plugin
        return
      cb()
    catch err
      cb err
    return
  (cb) ->
    origin = [
      os.hostname()
      'localhost'
      '127.0.0.1'
    ]
    _.each configuration.servers, (connection) ->
      if !_.contains(origin, connection.domain)
        origin.push connection.domain
      return
    module.exports = server = new (Hapi.Server)(connections:
      router:
        isCaseSensitive: false
        stripTrailingSlash: true
      routes:
        cors:
          origin: origin
          additionalHeaders: [
            'X-Requested-With'
            'token'
          ]
          credentials: true
        security: xframe: false
        files: relativeTo: __dirname)
    cb()
    return
  (cb) ->
    server.on 'internalError', (request, err) ->
      handleError err
      # if you want for format an error with html rather than JSON you can override:
      # request.response.output.payload
      # default is object.
      # statusCode is in request.response.output.statusCode
      # sample:
      # var response = {
      #     name: 'JsonWebTokenError',
      #     message: 'invalid signature',
      #     isBoom: true,
      #     data: null,
      #     output: {
      #         statusCode: 500,
      #         payload: {
      #             statusCode: 500,
      #             error: 'Internal Server Error',
      #             message: 'An internal server error occurred'
      #         },
      #         headers: {}
      #     }
      # };
      return
    process.on 'uncaughtException', (err) ->
      handleError err, true
      return
    process.on 'SIGTERM', ->
      server.log 'info', 'Server Shutting Down'
      return
    cb()
    return
  (cb) ->
    index = 0
    servers = configuration.servers
    async.whilst (->
      index < servers.length
    ), ((cb) ->
      connection = servers[index]
      connectionOptions =
        host: connection.host
        port: connection.port
        labels: [ connection.key ]
      if connection.https
        connectionOptions.tls =
          key: fs.readFileSync(util.format('%s/%s.key', connection.certificatesPath, connection.key))
          cert: fs.readFileSync(util.format('%s/%s.crt', connection.certificatesPath, connection.key))
      server.connection(connectionOptions).register {
        register: require(connection.key)
        select: [ connection.key ]
        options: setup: connection
      }, (err) ->
        index++
        cb err
        return
      return
    ), (err) ->
      cb err
      return
    return
  (cb) ->
    try
      index = 0
      plugins = configuration.plugins
      async.whilst (->
        index < plugins.length
      ), ((cb) ->
        server.register require(plugins[index]), (err) ->
          index++
          cb err
          return
        return
      ), (err) ->
        cb err
        return
    catch err
      cb err
    return
], (err) ->
  if err
    console.log err.message or err or 'UNKNOWN_ERROR'
    process.exit 1
  else
    # startem up the shields!!!
    server.start ->
      for index of server.connections
        connection = server.connections[index]
        key = connection.settings.labels[0]
        server.log 'info', util.format('%s Listening [%s:%s]', key.toUpperCase(), process.env.NODE_ENV or 'development', connection.info.port)
      server.log 'info', 'SERVER Initialized'
      return
  return
