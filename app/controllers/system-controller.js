'use strict';

var versionParser = require('../helpers/version-parser')();

var async = require('async');
var replyHelper;

var SystemInfo = function (request, reply) {
    var result = {};
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
        path: 'system/info',
        config: {
            handler: SystemInfo
        }
    }];
    return _this;
};
