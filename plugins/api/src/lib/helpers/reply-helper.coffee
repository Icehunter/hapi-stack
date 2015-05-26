'use strict'

server = undefined
version = require('../../package.json').version
tool = require('cloneextend')
moment = require('moment')
formatters = require('./formatters')()

Handle = (reply, err, data, code) ->
  meta = meta: build: version
  if err
    error = formatters.formatError(err)
    server.log 'error', error
    meta = tool.extend(meta, meta: error)
  else
    meta = tool.extend(meta, meta:
      success: true
      time_stamp: new Date(moment.utc().format()))
  reply(tool.extend(meta, meta: data: data)).code code or (if err then 500 else 200)
  return

module.exports = (server) ->
  server = server
  _this = exports
  _this.handle = Handle
  _this
