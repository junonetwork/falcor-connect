"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = exports.isAtom = exports.isEmpty = exports.isErrorSentinel = exports.isPathSets = void 0;
var ramda_1 = require("ramda");
exports.isPathSets = function (paths) {
    if (!Array.isArray(paths)) {
        return false;
    }
    if (paths.length === 0) {
        return false;
    }
    for (var i = 0; i < paths.length; i += 1) {
        if (!Array.isArray(paths[i])) {
            return false;
        }
    }
    return true;
};
exports.isErrorSentinel = function (fragment) {
    return ramda_1.propEq('$type', 'error', fragment);
};
exports.isEmpty = function (fragment) {
    return fragment === undefined || fragment.value === null;
};
exports.isAtom = function (atom, value) {
    if (atom === undefined || atom.$type !== 'atom') {
        return false;
    }
    else if (value === undefined) {
        return true;
    }
    return ramda_1.equals(value, atom.value);
};
exports.map = function (project, falcorList) {
    var result = [];
    if (exports.isErrorSentinel(falcorList)) {
        return result;
    }
    for (var key in falcorList) {
        if (key !== 'length' && key !== '$__path' && !exports.isErrorSentinel(falcorList[key]) && !exports.isEmpty(falcorList[key])) {
            result.push(project(falcorList[key], parseInt(key, 10)));
        }
    }
    return result;
};
