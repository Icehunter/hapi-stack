'use strict';

var gulp = require('gulp-param')(require('gulp'), process.argv);
var eslint = require('gulp-eslint');
var jsbeautify = require('gulp-jsbeautifier');
var replace = require('gulp-regex-replace');

var paths = {
    js: [
        './app/**/*.js',
        './examples/**/*.js',
        './replacements/**/*.js',
        './gulpfile.js',
        './server.js'
    ]
};

gulp.task('beautify', function () {
    return gulp.src(paths.js, {
            base: './'
        })
        .pipe(jsbeautify({
            config: '.jsbeautifyrc',
            mode: 'VERIFY_AND_WRITE'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('lint-js', ['beautify'], function () {
    return gulp.src(paths.js)
        .pipe(eslint({
            useEslintrc: true
        }))
        .pipe(eslint.formatEach())
        .pipe(eslint.failAfterError());
});

gulp.task('replace-env', function (env) {
    var ENV = require('./replacements/' + (env || 'development') + '/env.js');
    return gulp.src([
            './replacements/templates/config/env.json'
        ])
        .pipe(replace(ENV))
        .pipe(gulp.dest('./configuration/'));
});

gulp.task('replace-common', [
    'replace-env'
], function () {
    var commonENV = require('./replacements/common/env.js');
    return gulp.src([
            './configuration/env.json'
        ])
        .pipe(replace(commonENV))
        .pipe(gulp.dest('./configuration/'));
});

gulp.task('replace', [
    'replace-common'
]);

gulp.task('default', [
    'lint-js',
    'replace'
]);
