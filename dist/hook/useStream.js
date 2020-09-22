"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStream = void 0;
var react_1 = require("react");
var rxjs_1 = require("rxjs");
exports.useStream = function (project, data) {
    var result = react_1.useRef();
    var synchronous = react_1.useRef(true);
    var rerendering = react_1.useRef(false);
    var stream$ = react_1.useRef(new rxjs_1.Subject());
    var subscription = react_1.useRef(null);
    var _a = react_1.useState(false), _ = _a[0], rerender = _a[1];
    if (subscription.current === null) {
        subscription.current = stream$.current.pipe(project).subscribe({
            next: function (next) {
                result.current = next;
                if (!synchronous.current) {
                    rerendering.current = true;
                    rerender(function (x) { return !x; });
                }
            }
        });
    }
    react_1.useEffect(function () { return function () {
        if (subscription.current !== null) {
            subscription.current.unsubscribe();
        }
    }; }, []);
    if (!rerendering.current) {
        synchronous.current = true;
        result.current = undefined;
        stream$.current.next(data);
        synchronous.current = false;
    }
    rerendering.current = false;
    return result.current;
};
