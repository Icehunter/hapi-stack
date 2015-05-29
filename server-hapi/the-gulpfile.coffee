'use strict'

gulp = require('gulp-param')(require('gulp'), process.argv)
sourcemaps = require('gulp-sourcemaps')
eslint = require('gulp-eslint')
jsbeautify = require('gulp-jsbeautifier')
coffeelint = require('gulp-coffeelint')
coffee = require('gulp-coffee')
gutil = require('gulp-util')
_ = require('underscore')
replace = require('gulp-regex-replace')

getAllFiles = ->
  _.union paths.js, paths.bdd, paths.e2e

paths =
  coffee: [ './src/**/*.coffee' ],
  js: [
    './app/**/*.js',
    './examples/**/*.js',
    './gulpfile.js',
    './server.js'
  ]

gulp.task 'lint', ->
  gulp.src(paths.coffee.concat [ './the-gulpfile.coffee' ])
    .pipe(coffeelint(optFile: 'coffeelint.json'))
    .pipe coffeelint.reporter('coffeelint-stylish')
    .pipe coffeelint.reporter('fail')
    .pipe coffeelint.reporter()
gulp.task 'coffee', [ 'lint' ], ->
  gulp.src(paths.coffee)
    .pipe(sourcemaps.init())
    .pipe(coffee(bare: true).on('error', gutil.log))
    .pipe(sourcemaps.write('.'))
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
gulp.task 'replace-env', (env) ->
  ENV = require('./replacements/' + (env or 'development') + '/env.js')
  gulp.src([ './replacements/templates/config/env.json' ])
    .pipe(replace(ENV))
    .pipe gulp.dest('./configuration/')
gulp.task 'replace-common', [ 'replace-env' ], ->
  commonENV = require('./replacements/common/env.js')
  gulp.src([ './configuration/env.json' ])
    .pipe(replace(commonENV))
    .pipe gulp.dest('./configuration/')
gulp.task 'replace', [
    'replace-common'
]
gulp.task 'default', [ 'lint-js', 'replace' ]
