'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var ENV = require('./replacements/' + (grunt.option('env') || 'development') + '/env.json');
    var commonENV = require('./replacements/common/env.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            options: {
                configFile: './.eslintrc'
            },
            target: [
                'app/**/*.js',
                'configuration/**/*.js',
                'gruntfile.js',
                'server.js'
            ]
        },
        jsbeautifier: {
            files: [
                'app/**/*.js',
                'configuration/**/*.js',
                'gruntfile.js',
                'server.js'
            ],
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
                files: [
                    '.jsbeautifyrc',
                    '.jshintrc',
                    'app/**/*.js',
                    'configuration/**/*.js',
                    'gruntfile.js',
                    'server.js'
                ],
                tasks: [
                    'common'
                ]
            },
            test: {
                files: [
                    '.jsbeautifyrc',
                    '.jshintrc',
                    'app/**/*.js',
                    'configuration/**/*.js',
                    'gruntfile.js',
                    'server.js'
                ],
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
