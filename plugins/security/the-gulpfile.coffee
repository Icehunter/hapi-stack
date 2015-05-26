'use strict'

gulp = require('gulp-param')(require('gulp'), process.argv)
eslint = require('gulp-eslint')
jsbeautify = require('gulp-jsbeautifier')
coffee = require('gulp-coffee')
coffeelint = require('gulp-coffeelint')
gutil = require('gulp-util')
_ = require('underscore')

paths =
  coffee: [ './src/**/*.coffee' ]
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
gulp.task 'default', [ 'lint-js' ]
