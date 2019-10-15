import { Observable } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'


export const switchScan = <T, R>(
  accumulator: (acc: R, value: T, index: number) => Observable<R>,
  seed: R
) => (source$: Observable<T>) => {
  let acc = seed
  return source$.pipe(
    switchMap((value, index) => accumulator(acc, value, index)),
    tap((value) => acc = value)
  )
}
