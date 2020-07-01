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
exports.WithFalcor = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var mapPropsStream_1 = require("../mapPropsStream");
var connect_1 = require("../connect");
exports.WithFalcor = function (model, graphChange$, options) {
    if (options === void 0) { options = {}; }
    var connectedModel = connect_1.connect(model, graphChange$, options);
    return function (paths) { return mapPropsStream_1.mapPropsStream(function (props$) { return rxjs_1.combineLatest(props$, props$.pipe(operators_1.map(function (props) { return typeof paths === 'function' ? paths(props) : paths; }), connectedModel)).pipe(operators_1.map(function (_a) {
        var props = _a[0], falcorProps = _a[1];
        return (__assign(__assign({}, falcorProps), props));
    })); }); };
};
