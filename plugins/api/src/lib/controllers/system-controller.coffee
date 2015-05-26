'use strict'

versionParser = require('../helpers/version-parser')()
async = require('async')
replyHelper = undefined

SystemInfo = (request, reply) ->
  result = {}
  async.series [
    (cb) ->
      result.version_info = versionParser.getVersionInfo()
      cb()
      return
    (cb) ->
      result.environment = {}
      for key of process.env
        result.environment[key] = process.env[key]
      cb()
      return
  ], (err) ->
    replyHelper.handle reply, err, result
    return
  return

module.exports = (server) ->
  replyHelper = require('../helpers/reply-helper')(server)
  _this = exports
  _this.routes = [ {
    method: 'GET'
    path: '/api/status'
    config: handler: SystemInfo
  } ]
  _this
