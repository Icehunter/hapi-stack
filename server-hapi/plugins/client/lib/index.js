'use strict';

// var internals = {};
var async = require('async');
var path = require('path');

exports.register = function (server, options, next) {
    async.series([
        // register view engines
        function (cb) {
            var caching = (process.env.NODE_ENV === 'production') ? true : false;
            var engineOptions = {
                caching: caching
            };
            var engine = require('hapijs-react-views')(engineOptions);

            server.views({
                defaultExtension: 'jsx',
                engines: {
                    jsx: engine,
                    js: engine
                },
                isCached: caching,
                path: path.join(__dirname, './views'),
                relativeTo: __dirname
            });
            cb();
        },
        // if using social signin remove cb() and uncomment this and loginRoutess() in configuratin/routes.js
        // function (cb) {
        //     server.register(require('bell'), function (err) {
        //         if (err) {
        //             cb(err);
        //         }
        //         else {
        //             var socialSites = require('./social')(server);
        //             var counter = 0;
        //             async.whilst(function () {
        //                     return counter < socialSites.length;
        //                 },
        //                 function (callback) {
        //                     var site = socialSites[counter];
        //                     server.auth.strategy(site.provider, 'bell', site);
        //                     counter++;
        //                     callback();
        //                 },
        //                 function (err) {
        //                     cb(err);
        //                 });
        //         }
        //     });
        // },
        // register routes
        function (cb) {
            require('./configuration/routes')().resolveRoutes(server);
            cb();
        }
    ], function (err) {
        next(err);
    });
};

exports.register.attributes = {
    pkg: require('../package.json')
};