import { Observable, Subject, Subscription } from 'rxjs';
import { ComponentType, Component } from 'react';
export declare const mapPropsStream: <InnerProps, OutterProps>(project: (props$: Observable<OutterProps>) => Observable<InnerProps>) => (wrappedComponent: ComponentType<InnerProps>) => {
    new (props: Readonly<OutterProps>): {
        state: {
            mappedProps: InnerProps | undefined;
        };
        props$: Subject<OutterProps>;
        subscription: Subscription;
        componentDidMount(): void;
        UNSAFE_componentWillReceiveProps(nextProps: OutterProps): void;
        shouldComponentUpdate(props: OutterProps, state: {
            mappedProps: InnerProps | undefined;
        }): boolean;
        componentWillUnmount(): void;
        render(): import("react").ReactElement<InnerProps, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => Component<any, any, any>)> | null) | (new (props: any) => Component<any, any, any>)> | null;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<OutterProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<OutterProps> & Readonly<{
            children?: import("react").ReactNode;
        }>;
        refs: {
            [key: string]: import("react").ReactInstance;
        };
        componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<OutterProps>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<OutterProps>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<OutterProps>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<OutterProps>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<OutterProps>, nextState: Readonly<{}>, nextContext: any): void;
    };
    new (props: OutterProps, context?: any): {
        state: {
            mappedProps: InnerProps | undefined;
        };
        props$: Subject<OutterProps>;
        subscription: Subscription;
        componentDidMount(): void;
        UNSAFE_componentWillReceiveProps(nextProps: OutterProps): void;
        shouldComponentUpdate(props: OutterProps, state: {
            mappedProps: InnerProps | undefined;
        }): boolean;
        componentWillUnmount(): void;
        render(): import("react").ReactElement<InnerProps, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => Component<any, any, any>)> | null) | (new (props: any) => Component<any, any, any>)> | null;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<OutterProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<OutterProps> & Readonly<{
            children?: import("react").ReactNode;
        }>;
        refs: {
            [key: string]: import("react").ReactInstance;
        };
        componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<OutterProps>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<OutterProps>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<OutterProps>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<OutterProps>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<OutterProps>, nextState: Readonly<{}>, nextContext: any): void;
    };
    contextType?: import("react").Context<any> | undefined;
};
//# sourceMappingURL=mapPropsStream.d.ts.map