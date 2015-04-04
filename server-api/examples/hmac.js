'use strict';

var httpSignature = require('http-signature');
var http = require('http');

var client = {
    clientId: 'a65ba159-337a-4feb-b22e-6324edfa8728',
    clientSecret: 'e5e1e294-9f6c-4fd1-ad5b-fb8a04b56575'
};

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
        console.log('Valid:', httpSignature.verifySignature(parsed, client.clientSecret));
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
        algorithm: 'hmac-sha512',
        key: client.clientSecret,
        keyId: client.clientId
    });
    request.end(body);
});
