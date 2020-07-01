"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseFalcor = void 0;
var useStream_1 = require("./useStream");
var connect_1 = require("../connect");
exports.UseFalcor = function (model, graphChange$, options) {
    if (options === void 0) { options = {}; }
    var connectedModel = connect_1.connect(model, graphChange$, options);
    return function (pathSets) {
        var _a;
        return (_a = useStream_1.useStream(connectedModel, pathSets)) !== null && _a !== void 0 ? _a : { status: 'next', fragment: {} };
    };
};
