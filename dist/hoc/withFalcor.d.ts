/// <reference types="falcor-json-graph" />
/// <reference types="react" />
import { Model, PathSet } from 'falcor';
import { Observable } from 'rxjs';
import { Options } from '../connect';
export declare const WithFalcor: (model: Model, graphChange$: Observable<void>, options?: Options) => <Props, F extends Record<string, unknown> = Record<string, unknown>>(paths: Error | PathSet[] | ((props: Props) => PathSet[] | Error | null) | null) => (wrappedComponent: import("react").ComponentType<(import("../types").ErrorProps & Props) | (import("../types").NextProps<F> & Props) | (import("../types").CompleteProps<F> & Props)>) => {
    new (props: Readonly<Props>): {
        state: {
            mappedProps: (import("../types").ErrorProps & Props) | (import("../types").NextProps<F> & Props) | (import("../types").CompleteProps<F> & Props) | undefined;
        };
        props$: import("rxjs").Subject<Props>;
        subscription: import("rxjs").Subscription;
        componentDidMount(): void;
        UNSAFE_componentWillReceiveProps(nextProps: Props): void;
        shouldComponentUpdate(props: Props, state: {
            mappedProps: (import("../types").ErrorProps & Props) | (import("../types").NextProps<F> & Props) | (import("../types").CompleteProps<F> & Props) | undefined;
        }): boolean;
        componentWillUnmount(): void;
        render(): import("react").ReactElement<(import("../types").ErrorProps & Props) | (import("../types").NextProps<F> & Props) | (import("../types").CompleteProps<F> & Props), string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)> | null;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<Props>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<Props> & Readonly<{
            children?: import("react").ReactNode;
        }>;
        refs: {
            [key: string]: import("react").ReactInstance;
        };
        componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<Props>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<Props>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): void;
    };
    new (props: Props, context?: any): {
        state: {
            mappedProps: (import("../types").ErrorProps & Props) | (import("../types").NextProps<F> & Props) | (import("../types").CompleteProps<F> & Props) | undefined;
        };
        props$: import("rxjs").Subject<Props>;
        subscription: import("rxjs").Subscription;
        componentDidMount(): void;
        UNSAFE_componentWillReceiveProps(nextProps: Props): void;
        shouldComponentUpdate(props: Props, state: {
            mappedProps: (import("../types").ErrorProps & Props) | (import("../types").NextProps<F> & Props) | (import("../types").CompleteProps<F> & Props) | undefined;
        }): boolean;
        componentWillUnmount(): void;
        render(): import("react").ReactElement<(import("../types").ErrorProps & Props) | (import("../types").NextProps<F> & Props) | (import("../types").CompleteProps<F> & Props), string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)> | null;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<Props>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<Props> & Readonly<{
            children?: import("react").ReactNode;
        }>;
        refs: {
            [key: string]: import("react").ReactInstance;
        };
        componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<Props>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<Props>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): void;
    };
    contextType?: import("react").Context<any> | undefined;
};
//# sourceMappingURL=withFalcor.d.ts.map