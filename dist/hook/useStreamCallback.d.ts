import { Observable } from 'rxjs';
export declare const useStreamCallback: <T, R = unknown>(project: (stream$: Observable<T>) => Observable<R>, observer?: import("rxjs").NextObserver<R> | import("rxjs").ErrorObserver<R> | import("rxjs").CompletionObserver<R> | undefined) => (data: T) => void;
//# sourceMappingURL=useStreamCallback.d.ts.map