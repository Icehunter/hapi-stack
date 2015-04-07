'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var ENV = require('./replacements/' + (grunt.option('env') || 'development') + '/env.json');
    var commonENV = require('./replacements/common/env.json');

    var commonFILES = [
        'app/**/*.js',
        'configuration/**/*.js',
        'plugins/api/index.js',
        'plugins/api/lib/**/*.js',
        'plugins/client/index.js',
        'plugins/client/lib/**/*.js',
        'plugins/socketio/index.js',
        'plugins/socketio/lib/**/*.js',
        'connections.js',
        'gruntfile.js',
        'server.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            options: {
                configFile: './.eslintrc'
            },
            target: commonFILES
        },
        jsbeautifier: {
            files: commonFILES,
            options: {
                config: './.jsbeautifyrc'
            }
        },
        mochaTest: {
            BDD: {
                options: {
                    reporter: 'spec'
                },
                src: [
                    'test/**/*.js'
                ]
            }
        },
        env: {
            options: {},
            dev: {
                NODE_ENV: 'development'
            },
            test: {
                NODE_ENV: 'test'
            },
            production: {
                NODE_ENV: 'production'
            }
        },
        watch: {
            default: {
                files: commonFILES,
                tasks: [
                    'common'
                ]
            },
            test: {
                files: commonFILES,
                tasks: [
                    'test'
                ]
            }
        },
        replace: {
            env: {
                options: {
                    patterns: ENV.patterns
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: [
                        'replacements/templates/config/env.json'
                    ],
                    dest: 'configuration'
                }]
            },
            common: {
                options: {
                    patterns: commonENV.patterns
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: [
                        'configuration/env.json'
                    ],
                    dest: 'configuration'
                }]
            }
        }
    });

    grunt.registerTask('common', [
        'replace',
        'eslint',
        'jsbeautifier'
    ]);

    grunt.registerTask('test', function () {
        var tasks = [
            'common',
            'env:test',
            'mochaTest'
        ];
        if (grunt.option('watch')) {
            tasks.push('watch:test');
            return grunt.task.run(tasks);
        }
        grunt.task.run(tasks);
    });

    grunt.registerTask('build', [
        'common'
    ]);

    grunt.registerTask('default', [
        'common',
        'watch:default'
    ]);
};
