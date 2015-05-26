'use strict'

gulp = require('gulp-param')(require('gulp'), process.argv)
eslint = require('gulp-eslint')
jsbeautify = require('gulp-jsbeautifier')
coffee = require('gulp-coffee')
coffeelint = require('gulp-coffeelint')
gutil = require('gulp-util')
concat = require('gulp-concat')
dust = require('gulp-dust')
sass = require('gulp-sass')
minifyCss = require('gulp-minify-css')
rename = require('gulp-rename')
_ = require('underscore')

paths =
  coffee: [ './src/**/*.coffee' ]
  sass: [ './lib/scss/**/*.scss' ]
  views: server: [ './lib/views/**/*.dust' ]
  js: [
    './lib/**/*.js',
    './index.js',
    './gulpfile.js'
  ]

gulp.task 'lint', ->
  gulp.src(paths.coffee.concat [ './the-gulpfile.coffee' ])
    .pipe(coffeelint(optFile: 'coffeelint.json'))
    .pipe coffeelint.reporter('coffeelint-stylish')
    .pipe coffeelint.reporter('fail')
    .pipe coffeelint.reporter()
gulp.task 'coffee', [ 'lint' ], ->
  gulp.src(paths.coffee)
    .pipe(coffee(bare: true).on('error', gutil.log))
    .pipe gulp.dest('./')
gulp.task 'beautify', [ 'coffee' ], ->
  gulp.src(
    paths.js
    base: './')
    .pipe jsbeautify(
      config: '.jsbeautifyrc'
      mode: 'VERIFY_AND_WRITE')
    .pipe gulp.dest('./')
gulp.task 'lint-js', [ 'beautify' ], ->
  gulp.src(paths.js)
    .pipe(eslint(useEslintrc: true))
    .pipe(eslint.formatEach())
    .pipe eslint.failAfterError()
gulp.task 'sass-bootstrap', ->
  gulp.src('./lib/scss/bootstrap.scss')
    .pipe(sass())
    .pipe(gulp.dest('./lib/static/css/'))
    .pipe(minifyCss(keepSpecialComments: 0))
    .pipe(rename(extname: '.min.css'))
    .pipe gulp.dest('./lib/static/css/')
gulp.task 'sass-application', ->
  gulp.src('./lib/scss/application.scss')
    .pipe(sass())
    .pipe(gulp.dest('./lib/static/css/'))
    .pipe(minifyCss(keepSpecialComments: 0))
    .pipe(rename(extname: '.min.css'))
    .pipe gulp.dest('./lib/static/css/')
gulp.task 'server-views', ->
  gulp.src(paths.views.server)
    .pipe(dust())
    .pipe(concat('views.server.compiled'))
    .pipe gulp.dest('./lib/views/')
gulp.task 'sass', [
  'sass-bootstrap'
  'sass-application'
]
gulp.task 'default', [
    'lint-js'
    'sass',
    'server-views'
]
