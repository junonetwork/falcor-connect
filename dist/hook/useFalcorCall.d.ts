/// <reference types="falcor-json-graph" />
import { Model, Path, PathSet } from 'falcor';
import { Options } from '../connect';
import { ChildProps, NextProps, CompleteProps } from '../types';
export declare const UseFalcorCall: (model: Model, { errorHandler }?: Options) => <T = void, F extends Record<string, unknown> = Record<string, unknown>>(path: (data: T) => Path, args?: ((data: T) => unknown[]) | undefined, refPaths?: ((data: T) => PathSet[]) | undefined, thisPaths?: ((data: T) => PathSet[]) | undefined) => (import("..").ErrorProps & {
    handler: (data: T) => void;
}) | (NextProps<F> & {
    handler: (data: T) => void;
}) | (CompleteProps<F> & {
    handler: (data: T) => void;
});
//# sourceMappingURL=useFalcorCall.d.ts.map