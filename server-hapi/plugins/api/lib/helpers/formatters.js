'use strict';

var moment = require('moment');

var FormatError = function (err) {
    var error = {
        success: false,
        message: err.message || 'UNKNOWN_ERROR',
        time_stamp: new Date(moment.utc().format())
    };
    if (err.constructor === {}.constructor && Object.keys(err).length) {
        error.errors = [];
        for (var key in err) {
            error.errors.push(err[key]);
        }
    }
    if (process.env.DEBUG === 'true' && err.stack) {
        error.stack = err.stack;
    }
    return error;
};

module.exports = function () {
    var _this = exports;
    _this.formatError = FormatError;
    return _this;
};
