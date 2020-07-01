"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStreamCallback = void 0;
var react_1 = require("react");
var rxjs_1 = require("rxjs");
exports.useStreamCallback = function (project, observer) {
    var stream$ = react_1.useRef(new rxjs_1.ReplaySubject());
    react_1.useLayoutEffect(function () {
        var subscription = stream$.current.pipe(project).subscribe(observer);
        return function () { return subscription.unsubscribe(); };
    }, []);
    return react_1.useCallback(function (data) {
        stream$.current.next(data);
    }, []);
};
