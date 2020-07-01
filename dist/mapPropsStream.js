"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPropsStream = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var react_1 = require("react");
exports.mapPropsStream = function (project) { return function (wrappedComponent) {
    return (function (_super) {
        __extends(MapPropsStream, _super);
        function MapPropsStream() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = { mappedProps: undefined };
            _this.props$ = new rxjs_1.Subject();
            return _this;
        }
        MapPropsStream.prototype.componentDidMount = function () {
            var _this = this;
            this.subscription = this.props$.pipe(operators_1.startWith(this.props), project).subscribe(function (mappedProps) {
                _this.setState({ mappedProps: mappedProps });
            });
        };
        MapPropsStream.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            this.props$.next(nextProps);
        };
        MapPropsStream.prototype.shouldComponentUpdate = function (props, state) {
            return this.state.mappedProps !== state.mappedProps;
        };
        MapPropsStream.prototype.componentWillUnmount = function () {
            this.subscription.unsubscribe();
        };
        MapPropsStream.prototype.render = function () {
            return this.state.mappedProps === undefined ?
                null :
                react_1.createElement(wrappedComponent, this.state.mappedProps);
        };
        return MapPropsStream;
    }(react_1.Component));
}; };
