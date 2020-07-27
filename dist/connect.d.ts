/// <reference types="falcor-json-graph" />
import { Observable } from 'rxjs';
import { PathSet, Model } from 'falcor';
import { ErrorProps, ChildProps } from './types';
export declare type Options = {
    errorHandler?: (error: unknown, caught?: Observable<unknown>) => Observable<ErrorProps>;
    equals?: (prev: PathSet[], next: PathSet[]) => boolean;
    progressive?: boolean;
};
export declare const defaultErrorHandler: (error: unknown) => Observable<ErrorProps>;
export declare const connect: (model: Model, graphChange$: Observable<void>, { errorHandler, equals, progressive }?: Options) => <T extends Record<string, unknown> = Record<string, unknown>>(pathSets$: Observable<PathSet[] | Error | null>) => Observable<ChildProps<T>>;
//# sourceMappingURL=connect.d.ts.map