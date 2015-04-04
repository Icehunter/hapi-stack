'use strict';

var httpSignature = require('http-signature');
var http = require('http');
var fs = require('fs');

var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({
    host: '127.0.0.1',
    port: 1337
});
server.route({
    method: 'POST',
    path: '/test',
    handler: function (request, reply) {
        var parsed = httpSignature.parseRequest(request);
        console.log('Headers:', request.headers);
        console.log('Payload:', request.payload);
        console.log('Parsed:', parsed);
        var pub = fs.readFileSync('../certificates/server.pub', 'ascii');
        console.log('Valid:', httpSignature.verifySignature(parsed, pub));
        reply({});
        process.exit(1);
    }
});
server.start(function () {
    var body = JSON.stringify({
        foo: 'bar'
    });
    var request = new http.ClientRequest({
        host: '127.0.0.1',
        port: 1337,
        path: '/test',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    });
    httpSignature.sign(request, {
        // algorithm: 'hmac-sha512',
        key: fs.readFileSync('../certificates/server.key', 'ascii'),
        keyId: 'rsa-key-1'
    });
    request.end(body);
});
