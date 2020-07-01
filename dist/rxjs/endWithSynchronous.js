"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endWithSynchronous = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
exports.endWithSynchronous = function (projectComplete) { return function (stream$) {
    return new rxjs_1.Observable(function (observer) {
        return new rxjs_1.Observable(function (innerObserver) {
            var _data;
            var sync = true;
            var complete = false;
            var subscription = stream$.subscribe({
                next: function (data) {
                    _data = data;
                    if (!sync) {
                        innerObserver.next(data);
                    }
                },
                error: function (error) { return innerObserver.error(error); },
                complete: function () {
                    complete = true;
                    if (!sync) {
                        innerObserver.next(projectComplete(_data));
                        innerObserver.complete();
                    }
                }
            });
            sync = false;
            if (complete) {
                observer.next(projectComplete(_data));
                innerObserver.complete();
            }
            else if (_data !== undefined) {
                observer.next(_data);
            }
            return subscription;
        })
            .pipe(operators_1.debounceTime(0))
            .subscribe(observer);
    });
}; };
