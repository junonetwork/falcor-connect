"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseFalcorCall = void 0;
var react_1 = require("react");
var rxjs_1 = require("rxjs");
var __1 = require("..");
var operators_1 = require("rxjs/operators");
var connect_1 = require("../connect");
var startWithSynchronous_1 = require("../rxjs/startWithSynchronous");
var endWithSynchronous_1 = require("../rxjs/endWithSynchronous");
exports.UseFalcorCall = function (model, _a) {
    var _b = (_a === void 0 ? {} : _a).errorHandler, errorHandler = _b === void 0 ? connect_1.defaultErrorHandler : _b;
    return function (path, args, refPaths, thisPaths) {
        var _a = react_1.useState({ status: 'complete', fragment: {} }), props = _a[0], setState = _a[1];
        var handler = __1.useStreamCallback(function (stream$) { return stream$.pipe(operators_1.switchMap(function (data) {
            return rxjs_1.from(model.call(path(data), args ? args(data) : [], refPaths ? refPaths(data) : [], thisPaths ? thisPaths(data) : [])).pipe(operators_1.map(function (_a) {
                var json = _a.json;
                return ({ fragment: json, status: 'next' });
            }), startWithSynchronous_1.startWithSynchronous(function (envelope) { return ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'next' }); }), endWithSynchronous_1.endWithSynchronous(function (envelope) { return ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'complete' }); }), operators_1.catchError(errorHandler));
        })); }, { next: function (props) { return setState(props); } });
        return __assign(__assign({}, props), { handler: handler });
    };
};
