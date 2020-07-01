/// <reference types="falcor-json-graph" />
import { Observable } from 'rxjs';
import { PathSet, Model } from 'falcor';
import { ErrorProps, ChildProps } from './types';
export declare type Options = {
    errorHandler?: (error: Error, caught?: Observable<unknown>) => Observable<ChildProps>;
    equals?: (prev: PathSet[], next: PathSet[]) => boolean;
};
export declare const defaultErrorHandler: (error: Error) => Observable<ErrorProps>;
export declare const connect: (model: Model, graphChange$: Observable<undefined>, { errorHandler, equals }?: Options) => <T extends Record<string, unknown> = Record<string, unknown>>(pathSets$: Observable<PathSet[] | Error | null>) => Observable<ChildProps<T>>;
//# sourceMappingURL=connect.d.ts.map