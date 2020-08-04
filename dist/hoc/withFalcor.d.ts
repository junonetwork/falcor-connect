/// <reference types="falcor-json-graph" />
import { ComponentType } from 'react';
import { Model, PathSet } from 'falcor';
import { Observable } from 'rxjs';
import { ChildProps } from '../types';
import { Options } from '../connect';
export declare const WithFalcor: (model: Model, graphChange$: Observable<void>, options?: Options) => <Props, F extends Record<string, unknown> = Record<string, unknown>>(paths: Error | PathSet[] | ((props: Props) => PathSet[] | Error | null) | null) => (wrappedComponent: ComponentType<(import("../types").ErrorProps & Props) | (import("../types").NextProps<F> & Props) | (import("../types").CompleteProps<F> & Props)>) => (props: Props) => import("react").ReactElement<(import("../types").ErrorProps & Props) | (import("../types").NextProps<F> & Props) | (import("../types").CompleteProps<F> & Props), string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)>;
//# sourceMappingURL=withFalcor.d.ts.map