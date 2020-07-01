import { Observable } from 'rxjs';
export declare const useStream: <T, R>(project: (stream$: Observable<T>) => Observable<R>, data: T) => R | undefined;
//# sourceMappingURL=useStream.d.ts.map