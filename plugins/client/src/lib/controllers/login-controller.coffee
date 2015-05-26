'use strict'

TwitterLogin = (request, reply) ->
  # Perform any account lookup or registration, setup local session,
  # and redirect to the application. The third-party credentials are
  # stored in request.auth.credentials. Any query parameters from
  # the initial request are passed back via request.auth.credentials.query.
  reply.redirect '/'
  return

GoogleLogin = (request, reply) ->
  # Perform any account lookup or registration, setup local session,
  # and redirect to the application. The third-party credentials are
  # stored in request.auth.credentials. Any query parameters from
  # the initial request are passed back via request.auth.credentials.query.
  reply.redirect '/'
  return

module.exports = ->
  _this = exports
  _this.routes = [
    {
      method: [
        'GET'
        'POST'
      ]
      path: '/login/twitter'
      config:
        auth: strategies: [ 'twitter' ]
        handler: TwitterLogin
    }
    {
      method: [
        'GET'
        'POST'
      ]
      path: '/login/google'
      config:
        auth: strategies: [ 'google' ]
        handler: GoogleLogin
    }
  ]
  _this
