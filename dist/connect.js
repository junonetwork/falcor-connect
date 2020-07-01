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
        fragment: {},
        status: 'error',
        error: error instanceof Error ? error : new Error(error)
    });
};
exports.connect = function (model, graphChange$, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.errorHandler, errorHandler = _c === void 0 ? exports.defaultErrorHandler : _c, _d = _b.equals, equals = _d === void 0 ? ramda_1.equals : _d;
    return function (pathSets$) {
        var defaultNextProps = { fragment: {}, status: 'next' };
        var defaultCompleteProps = { fragment: {}, status: 'complete' };
        var subject = new rxjs_1.ReplaySubject(1);
        var complete = false;
        var _result = defaultCompleteProps;
        return pathSets$.pipe(operators_1.startWith([]), operators_1.bufferCount(2, 1), operators_1.scan(function (query$, _a) {
            var prevPaths = _a[0], paths = _a[1];
            if (paths instanceof Error) {
                return rxjs_1.of({ fragment: {}, status: 'error', error: paths });
            }
            else if (paths === null) {
                return rxjs_1.of(defaultNextProps);
            }
            else if (paths.length === 0) {
                return rxjs_1.of(defaultCompleteProps);
            }
            else if (prevPaths !== null && !(prevPaths instanceof Error) && complete && equals(prevPaths, paths)) {
                subject.next(_result);
                return query$;
            }
            complete = false;
            return rxjs_1.from(model.get.apply(model, paths).progressively()).pipe(operators_1.map(function (_a) {
                var json = _a.json;
                return ({ fragment: json, status: 'next' });
            }), startWithSynchronous_1.startWithSynchronous(function (envelope) { return ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'next' }); }), endWithSynchronous_1.endWithSynchronous(function (envelope) { return ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'complete' }); }), operators_1.catchError(errorHandler), operators_1.repeatWhen(function () { return graphChange$; }), operators_1.multicast(subject), operators_1.refCount(), operators_1.tap(function (result) { return _result = result; }), operators_1.finalize(function () { return complete = true; }));
        }, rxjs_1.of({ fragment: {}, status: 'complete' })), operators_1.distinctUntilChanged(), operators_1.switchAll());
    };
};
