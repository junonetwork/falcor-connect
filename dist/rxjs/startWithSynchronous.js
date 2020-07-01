"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWithSynchronous = void 0;
var rxjs_1 = require("rxjs");
exports.startWithSynchronous = function (projectNext) { return function (stream$) {
    return new rxjs_1.Observable(function (observer) {
        var _data;
        var sync = true;
        var complete = false;
        var subscription = stream$.subscribe(function (data) {
            _data = data;
            if (!sync) {
                observer.next(data);
            }
        }, function (error) { return observer.error(error); }, function () {
            complete = true;
            if (!sync) {
                observer.complete();
            }
        });
        sync = false;
        observer.next(projectNext(_data));
        if (complete) {
            observer.complete();
        }
        return subscription;
    });
}; };
