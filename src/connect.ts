import { Observable, of, from, Subscribable, ReplaySubject } from 'rxjs'
import { PathSet, Model, JSONEnvelope } from 'falcor'
import { equals as deepEquals } from 'ramda'
import { Fragment, ErrorProps, ChildProps } from './types'
import { catchError, repeatWhen, map, refCount, multicast, scan, distinctUntilChanged, bufferCount, startWith, switchAll, tap, finalize } from 'rxjs/operators'
import { startWithSynchronous } from './rxjs/startWithSynchronous'
import { endWithSynchronous } from './rxjs/endWithSynchronous'


export type Options = {
  errorHandler?: (error: Error, caught?: Observable<unknown>) => Observable<ChildProps>
  equals?: (prev: PathSet[], next: PathSet[]) => boolean
}


export const defaultErrorHandler = (error: Error) => {
  console.error(error)
  return of<ErrorProps>({
    fragment: {}, status: 'error' as const, error: error instanceof Error ? error : new Error(error)
  })
}


export const connect = (
  model: Model,
  graphChange$: Observable<undefined>,
  { errorHandler = defaultErrorHandler, equals = deepEquals }: Options = {}
) => <T extends Fragment = Fragment>(pathSets$: Observable<PathSet[] | Error | null>): Observable<ChildProps<T>> => {
  const defaultNextProps: ChildProps<T> = { fragment: {}, status: 'next' as const }
  const defaultCompleteProps: ChildProps<T> = { fragment: {}, status: 'complete' as const }
  const subject = new ReplaySubject<ChildProps<T>>(1)
  let complete = false
  let _result: ChildProps<T> = defaultCompleteProps

  return pathSets$.pipe(
    startWith([]),
    bufferCount(2, 1),
    scan((query$, [prevPaths, paths]) => {
      if (paths instanceof Error) {
        return of<ChildProps<T>>({ fragment: {}, status: 'error' as const, error: paths })
      } else if (paths === null) {
        return of<ChildProps<T>>(defaultNextProps)
      } else if (paths.length === 0) {
        return of<ChildProps<T>>(defaultCompleteProps)
      } else if (prevPaths !== null && !(prevPaths instanceof Error) && complete && equals(prevPaths, paths)) {
        /**
         * TODO
         * what if pathSet$ emits twice quickly with identical values before the model emits?
         * rather than waiting for model, will unsubscribe from model and return stale _result
         * need to invalidate _result
         */
        subject.next(_result)
        return query$
      }

      complete = false
      return from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Partial<T>>>).pipe(
        map<JSONEnvelope<Partial<T>>, ChildProps<T>>(({ json }) => ({ fragment: json, status: 'next' as const })),
        startWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'next' as const })),
        endWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'complete' as const })),
        catchError<ChildProps<T>, Observable<ChildProps<T>>>(errorHandler),
        repeatWhen<ChildProps<T>>(() => graphChange$),
        multicast(subject),
        refCount(), // TODO - replace with shareReplay or publishReplay?: https://itnext.io/the-magic-of-rxjs-sharing-operators-and-their-differences-3a03d699d255
        tap((result) => _result = result),
        finalize(() => complete = true)
      )
    }, of<ChildProps<T>>({ fragment: {}, status: 'complete' as const })),
    distinctUntilChanged(),
    switchAll()
  )
}


/**
 * can we make this simpler? do we need to share model execution?
 * we are only subscribing to the result Observable<ChildProps<T>> once
 */
// export const connect2 = (
//   model: Model,
//   graphChange$: Observable<undefined>,
//   { errorHandler = defaultErrorHandler, equals = deepEquals }: Options = {}
// ) => <F extends Fragment = Fragment>(pathSets$: Observable<PathSet[] | Error | null>): Observable<ChildProps<T>> => {
//   let complete = false
//   let _result: ChildProps<T> = { fragment: {}, status: 'complete' }

//   return pathSets$.pipe(
//     startWith([]),
//     bufferCount(2, 1),
//     switchMap(([prevPaths, paths]) => {
//       if (paths instanceof Error) {
//         return of<ChildProps<T>>({ fragment: {}, status: 'error', error: paths })
//       } else if (paths === null) {
//         return of<ChildProps<T>>({ fragment: {}, status: 'next' })
//       } else if (paths.length === 0) {
//         return of<ChildProps<T>>({ fragment: {}, status: 'complete' })
//       } else if (prevPaths !== null && !(prevPaths instanceof Error) && complete && equals(prevPaths, paths)) {
//         of(_result)
//       }

//       complete = false
//       return from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Partial<T>>>).pipe(
//         map(({ json }) => ({ fragment: json, status: 'next' })),
//         startWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'next' })),
//         endWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'complete' })),
//         catchError(errorHandler),
//         repeatWhen(() => graphChange$),
//         tap((result) => _result = result),
//         finalize(() => complete = true)
//       )
//     })
//   )
// }

/**
 * Connect without memoizing output based on input paths
 */
// export const connect = (
//   model: Model,
//   graphChange$: Observable<undefined>,
//   { errorHandler = defaultErrorHandler }: Options = {}
// ) => {
//   const graphChangeHandler = () => graphChange$

//   return <F extends Fragment = Fragment>(
//     pathSets$: Observable<PathSet[] | Error | null>
//   ): Observable<ChildProps<T>> => pathSets$.pipe(
//     switchMap((paths) => {
//       if (paths instanceof Error) {
//         return of({ fragment: {}, status: 'error', error: paths })
//       } else if (paths === null) {
//         return of({ fragment: {}, status: 'next' })
//       } else if (paths.length === 0) {
//         return of({ fragment: {}, status: 'complete' })
//       }

//       return from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Partial<T>>>).pipe(
//         map(({ json }) => ({ fragment: json, status: 'next' })),
//         startWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'next' })),
//         endWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'complete' })),
//         catchError(errorHandler),
//         repeatWhen(graphChangeHandler)
//       )
//     })
//   )
// }
