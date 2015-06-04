'use strict';

var gulp = require('gulp-param')(require('gulp'), process.argv);
var eslint = require('gulp-eslint');
var jsbeautify = require('gulp-jsbeautifier');

var paths = {
    js: [
        './lib/**/*.js',
        './index.js',
        './gulpfile.js'
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

gulp.task('lint-js', [
    'beautify'
], function () {
    return gulp.src(paths.js)
        .pipe(eslint({
            useEslintrc: true
        }))
        .pipe(eslint.formatEach())
        .pipe(eslint.failAfterError());
});

gulp.task('default', [
    'lint-js'
]);
