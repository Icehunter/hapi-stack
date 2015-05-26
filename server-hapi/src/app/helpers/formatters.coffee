'use strict'

moment = require('moment')

FormatError = (err) ->
  error =
    success: false
    message: err.message or 'UNKNOWN_ERROR'
    time_stamp: new Date(moment.utc().format())
  if err.constructor == {}.constructor and Object.keys(err).length
    error.errors = []
    for key of err
      error.errors.push err[key]
  if process.env.DEBUG == 'true' and err.stack
    error.stack = err.stack
  error

module.exports = ->
  _this = exports
  _this.formatError = FormatError
  _this
