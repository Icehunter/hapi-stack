'use strict';

var gulp = require('gulp-param')(require('gulp'), process.argv);
var eslint = require('gulp-eslint');
var jsbeautify = require('gulp-jsbeautifier');
var concat = require('gulp-concat');
var dust = require('gulp-dust');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');

var paths = {
    sass: ['./lib/scss/**/*.scss'],
    views: {
        server: ['./lib/views/**/*.dust']
    },
    js: ['./lib/**/*.js', './index.js', './gulpfile.js']
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

gulp.task('sass-bootstrap', function () {
    return gulp.src('./lib/scss/bootstrap.scss')
        .pipe(sass())
        .pipe(gulp.dest('./lib/static/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('./lib/static/css/'));
});

gulp.task('sass-application', function () {
    return gulp.src('./lib/scss/application.scss')
        .pipe(sass())
        .pipe(gulp.dest('./lib/static/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('./lib/static/css/'));
});

gulp.task('server-views', function () {
    return gulp.src(paths.views.server)
        .pipe(dust())
        .pipe(concat('views.server.compiled'))
        .pipe(gulp.dest('./lib/views/'));
});

gulp.task('sass', [
    'sass-bootstrap',
    'sass-application'
]);

gulp.task('default', [
    'lint-js',
    'sass',
    'server-views'
]);
