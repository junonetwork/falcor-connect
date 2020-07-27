"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.defaultErrorHandler = void 0;
var rxjs_1 = require("rxjs");
var ramda_1 = require("ramda");
var operators_1 = require("rxjs/operators");
var startWithSynchronous_1 = require("./rxjs/startWithSynchronous");
var endWithSynchronous_1 = require("./rxjs/endWithSynchronous");
exports.defaultErrorHandler = function (error) {
    console.error(error);
    return rxjs_1.of({
        fragment: null,
        status: 'error',
        error: error instanceof Error ? error : typeof error === 'string' ? new Error(error) : new Error()
    });
};
exports.connect = function (model, graphChange$, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.errorHandler, errorHandler = _c === void 0 ? exports.defaultErrorHandler : _c, _d = _b.equals, equals = _d === void 0 ? ramda_1.equals : _d, _e = _b.progressive, progressive = _e === void 0 ? true : _e;
    return function (pathSets$) {
        var defaultNextProps = { fragment: {}, status: 'next' };
        var defaultCompleteProps = { fragment: {}, status: 'complete' };
        var subject = new rxjs_1.ReplaySubject(1);
        var complete = false;
        var prevChildProps;
        return pathSets$.pipe(operators_1.startWith([]), operators_1.bufferCount(2, 1), operators_1.scan(function (query$, _a) {
            var prevPaths = _a[0], paths = _a[1];
            if (paths instanceof Error) {
                return rxjs_1.of({ fragment: null, status: 'error', error: paths });
            }
            else if (paths === null) {
                return rxjs_1.of(defaultNextProps);
            }
            else if (paths.length === 0) {
                return rxjs_1.of(defaultCompleteProps);
            }
            else if (complete && prevChildProps && Array.isArray(prevPaths) && equals(prevPaths, paths)) {
                subject.next(prevChildProps);
                return query$;
            }
            complete = false;
            return rxjs_1.from(progressive ?
                model.get.apply(model, paths).progressively() :
                model.get.apply(model, paths)).pipe(operators_1.map(function (_a) {
                var json = _a.json;
                return ({ fragment: json, status: 'next' });
            }), startWithSynchronous_1.startWithSynchronous(defaultNextProps), endWithSynchronous_1.endWithSynchronous(function (envelope) { return envelope === undefined ? defaultCompleteProps : { fragment: envelope.fragment, status: 'complete' }; }), operators_1.catchError(errorHandler), operators_1.repeatWhen(function () { return graphChange$; }), operators_1.multicast(subject), operators_1.refCount(), operators_1.tap(function (_prevChildProps) { return prevChildProps = _prevChildProps; }), operators_1.finalize(function () { return complete = true; }));
        }, rxjs_1.of({ fragment: {}, status: 'complete' })), operators_1.distinctUntilChanged(), operators_1.switchAll());
    };
};
