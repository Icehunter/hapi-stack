'use strict'
# var internals = {};
HTTPSignature = require('http-signature')
async = require('async')

exports.register = (server, options, next) ->
  server.setup = options.setup or {}
  async.series [
    (cb) ->
      server.path __dirname
      cb()
      return
    (cb) ->
      server.register require('hapi-auth-signature'), (err) ->
        if err
          next err
        else
          HMAC = [ {
            id: 0
            username: 'monitor'
            clientID: 'cbe70b09-5089-46c1-b04e-e933cb570b8d'
            clientSecret: '164aefdd-ae33-47a3-ac23-7432f406e555'
          } ]
          RSA = []
          async.series [
            (cb) ->
              server.auth.strategy 'hmac', 'signature', validateFunc: (request, parsedSignature, callback) ->
                keyId = parsedSignature.keyId
                credentials = {}
                secretKey = undefined
                # api users should be loaded from the database and cached
                HMAC.forEach (user) ->
                  if user.clientID == keyId
                    secretKey = user.clientSecret
                    credentials =
                      id: user.id
                      username: user.username
                  return
                if !secretKey
                  callback null, false
                else
                  if HTTPSignature.verifySignature(parsedSignature, secretKey)
                    callback null, true, credentials
                  else
                    callback null, false
                return
              cb()
              return
            (cb) ->
              server.auth.strategy 'rsa', 'signature', validateFunc: (request, parsedSignature, callback) ->
                keyId = parsedSignature.keyId
                credentials = {}
                secretKey = undefined
                # api users should be loaded from the database and cached
                RSA.forEach (user) ->
                  if user.clientID == keyId
                    secretKey = user.clientSecret
                    credentials =
                      id: user.id
                      username: user.username
                  return
                if !secretKey
                  callback null, false
                else
                  if HTTPSignature.verifySignature(parsedSignature, secretKey)
                    callback null, true, credentials
                  else
                    callback null, false
                return
              cb()
              return
          ], (err) ->
            cb err
            return
        return
      return
  ], (err) ->
    next err
    return
  return

exports.register.attributes = pkg: require('../package.json')
