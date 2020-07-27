"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWithSynchronous = void 0;
var rxjs_1 = require("rxjs");
exports.startWithSynchronous = function (synchronousData) { return function (stream$) {
    return new rxjs_1.Observable(function (observer) {
        var pendingNext = true;
        var pendingComplete = true;
        var subscription = stream$.subscribe(function (data) {
            pendingNext = false;
            observer.next(data);
        }, function (error) { return observer.error(error); }, function () {
            pendingComplete = false;
            observer.complete();
        });
        if (pendingNext && pendingComplete) {
            observer.next(synchronousData);
        }
        return subscription;
    });
}; };
