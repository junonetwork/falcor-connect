import { Observable } from 'rxjs';
import { PathSet, Model } from 'falcor';
import { ChildProps } from '../types';
import { Options } from '../connect';
export declare const UseFalcor: (model: Model, graphChange$: Observable<undefined>, options?: Options) => <T extends Record<string, unknown> = Record<string, unknown>>(pathSets: PathSet[]) => ChildProps<T>;
//# sourceMappingURL=useFalcor.d.ts.map