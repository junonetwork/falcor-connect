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
var react_1 = require("react");
var useFalcor_1 = require("../hook/useFalcor");
exports.WithFalcor = function (model, graphChange$, options) {
    if (options === void 0) { options = {}; }
    var useFalcor = useFalcor_1.UseFalcor(model, graphChange$, options);
    return function (paths) { return function (wrappedComponent) {
        return function (props) {
            var falcorProps = useFalcor(typeof paths === 'function' ? paths(props) : paths);
            return react_1.createElement(wrappedComponent, __assign(__assign({}, props), falcorProps));
        };
    }; };
};
