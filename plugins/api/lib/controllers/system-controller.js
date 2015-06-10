'use strict';

var versionParser = require('../helpers/version-parser')();
var async = require('async');
var replyHelper = void 0;

var SystemInfo = function (request, reply) {
    var result;
    result = {};
    async.series([
        function (cb) {
            result.version_info = versionParser.getVersionInfo();
            cb();
        },
        function (cb) {
            result.environment = {};
            for (var key in process.env) {
                result.environment[key] = process.env[key];
            }
            cb();
        }
    ], function (err) {
        replyHelper.handle(reply, err, result);
    });
};

module.exports = function (server) {
    replyHelper = require('../helpers/reply-helper')(server);
    var _this = exports;
    _this.routes = [{
        method: 'GET',
        path: '/api/status',
        config: {
            handler: SystemInfo,
            description: 'System Package, Environment & Status',
            notes: 'Returns the status of the API along with current build information and ENV variables.',
            tags: [
                'api'
            ]
        }
    }];
    return _this;
};
