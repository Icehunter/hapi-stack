'use strict'

fs = require('fs')
path = require('path')

getDependencyVersionInfo = (parentPath, parentObject) ->
  packagePath = path.join(parentPath, 'package.json')
  if !fs.existsSync(packagePath)
    return
  packageInfo = JSON.parse(fs.readFileSync(packagePath, encoding: 'utf-8'))
  if !packageInfo.name
    return
  dependency = {}
  dependency.version = packageInfo.version
  if packageInfo._resolved
    dependency.resolved = packageInfo._resolved
  parentObject[packageInfo.name] = dependency
  for dependencyKey of packageInfo.dependencies
    if !dependency.dependencies
      dependency.dependencies = {}
    getDependencyVersionInfo path.join(parentPath, 'node_modules', dependencyKey), dependency.dependencies
  return

GetVersionInfo = ->
  versionTree = {}
  getDependencyVersionInfo path.join(__dirname, '../../'), versionTree
  versionTree

module.exports = ->
  _this = exports
  _this.getVersionInfo = GetVersionInfo
  _this
