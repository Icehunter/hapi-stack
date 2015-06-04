'use strict';

var fs = require('fs');
var path = require('path');

function getDependencyVersionInfo(parentPath, parentObject) {
    var packagePath = path.join(parentPath, 'package.json');
    if (!fs.existsSync(packagePath)) {
        return;
    }
    var packageInfo = JSON.parse(fs.readFileSync(packagePath, {
        encoding: 'utf-8'
    }));
    if (!packageInfo.name) {
        return;
    }
    var dependency = {};
    dependency.version = packageInfo.version;
    if (packageInfo._resolved) {
        dependency.resolved = packageInfo._resolved;
    }
    parentObject[packageInfo.name] = dependency;
    for (var dependencyKey in packageInfo.dependencies) {
        if (!dependency.dependencies) {
            dependency.dependencies = {};
        }
        getDependencyVersionInfo(path.join(parentPath, 'node_modules', dependencyKey), dependency.dependencies);
    }
}

var GetVersionInfo = function () {
    var versionTree = {};
    getDependencyVersionInfo(path.join(__dirname, '../../'), versionTree);
    return versionTree;
};

module.exports = function () {
    var _this = exports;
    _this.getVersionInfo = GetVersionInfo;
    return _this;
};
