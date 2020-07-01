import { Model, PathValue } from 'falcor';
import { ChildProps } from '../types';
import { Options } from '../connect';
export declare const UseFalcorSet: (model: Model, { errorHandler }?: Options) => <T = void, F extends Record<string, unknown> = Record<string, unknown>>(pathValue: (data: T) => PathValue[]) => (import("..").ErrorProps & {
    handler: (data: T) => void;
}) | (import("..").NextProps<F> & {
    handler: (data: T) => void;
}) | (import("..").CompleteProps<F> & {
    handler: (data: T) => void;
});
//# sourceMappingURL=useFalcorSet.d.ts.map