"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.path = exports.map = exports.isAtom = exports.isEmpty = exports.isErrorSentinel = exports.isPathSets = void 0;
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
    return fragment !== undefined && fragment !== null && fragment.$type === 'error';
};
exports.isEmpty = function (fragment) {
    return fragment === undefined || fragment.value === null;
};
exports.isAtom = function (atom, value) {
    var _a;
    if (((_a = atom) === null || _a === void 0 ? void 0 : _a.$type) !== 'atom') {
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
exports.path = function (value) {
    var path = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        path[_i - 1] = arguments[_i];
    }
    if (value === undefined) {
        return undefined;
    }
    var result = value;
    for (var i = 0; i < path.length; i++) {
        var next = result[path[i]];
        if (next === undefined || next === null) {
            return undefined;
        }
        else if (exports.isErrorSentinel(next)) {
            return next;
        }
        result = next;
    }
    return result;
};
