'use strict'

httpSignature = require('http-signature')
http = require('http')
fs = require('fs')
Hapi = require('hapi')
server = new (Hapi.Server)()
server.connection
  host: '127.0.0.1'
  port: 1337
server.route
  method: 'POST'
  path: '/test'
  handler: (request, reply) ->
    parsed = httpSignature.parseRequest(request)
    console.log 'Headers:', request.headers
    console.log 'Payload:', request.payload
    console.log 'Parsed:', parsed
    pub = fs.readFileSync('../certificates/api.pub', 'ascii')
    console.log 'Valid:', httpSignature.verifySignature(parsed, pub)
    reply {}
    process.exit 1
    return
server.start ->
  body = JSON.stringify(foo: 'bar')
  request = new (http.ClientRequest)(
    host: '127.0.0.1'
    port: 1337
    path: '/test'
    method: 'POST'
    headers:
      'Content-Type': 'application/json'
      'Content-Length': Buffer.byteLength(body))
  httpSignature.sign request,
    key: fs.readFileSync('../certificates/api.key', 'ascii')
    keyId: 'rsa-key-1'
  request.end body
  return
