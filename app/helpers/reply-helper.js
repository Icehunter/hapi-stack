'use strict';

var SERVER;

var version = require('../../package.json').version;
var tool = require('cloneextend');
var moment = require('moment');
var formatters = require('./formatters')();

var Handle = function (reply, err, data, code) {
    var meta = {
        meta: {
            build: version
        }
    };
    if (err) {
        var error = formatters.formatError(err);
        SERVER.log('error', error);
        meta = tool.extend(meta, {
            meta: error
        });
    }
    else {
        meta = tool.extend(meta, {
            meta: {
                success: true,
                time_stamp: new Date(moment.utc().format())
            }
        });
    }
    reply(tool.extend(meta, {
        meta: {
            data: data
        }
    })).code(code || (err ? 500 : 200));
};

module.exports = function (server) {
    SERVER = server;
    var _this = exports;
    _this.handle = Handle;
    return _this;
};
