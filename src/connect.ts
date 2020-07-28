import { Observable, of, from, Subscribable, ReplaySubject } from 'rxjs'
import { PathSet, Model, JSONEnvelope } from 'falcor'
import { equals as deepEquals } from 'ramda'
import { Fragment, ErrorProps, ChildProps, NextProps, CompleteProps } from './types'
import { catchError, repeatWhen, map, refCount, multicast, scan, distinctUntilChanged, bufferCount, startWith, switchAll, tap, finalize } from 'rxjs/operators'
import { startWithSynchronous } from './rxjs/startWithSynchronous'
import { endWithSynchronous } from './rxjs/endWithSynchronous'


export type Options = {
  errorHandler?: (error: unknown, caught?: Observable<unknown>) => Observable<ErrorProps>
  equals?: (prev: PathSet[], next: PathSet[]) => boolean
  progressive?: boolean
}


export const defaultErrorHandler = (error: unknown) => {
  console.error(error)
  return of<ErrorProps>({
    status: 'error',
    error: error instanceof Error ? error : typeof error === 'string' ? new Error(error) : new Error()
  })
}


export const connect = (
  model: Model,
  graphChange$: Observable<void>,
  { errorHandler = defaultErrorHandler, equals = deepEquals, progressive = true }: Options = {}
) => <T extends Fragment = Fragment>(pathSets$: Observable<PathSet[] | Error | null>): Observable<ChildProps<T>> => {
  const defaultNextProps: NextProps<T> = { fragment: {}, status: 'next' }
  const defaultCompleteProps: CompleteProps<T> = { fragment: {}, status: 'complete' }
  const subject = new ReplaySubject<ChildProps<T>>(1)
  let complete = false
  let prevChildProps: ChildProps<T> | undefined

  return pathSets$.pipe(
    startWith([]),
    bufferCount(2, 1),
    scan((query$, [prevPaths, paths]) => {
      if (paths instanceof Error) {
        return of<ErrorProps>({ status: 'error', error: paths })
      } else if (paths === null) {
        return of<NextProps<T>>(defaultNextProps)
      } else if (paths.length === 0) {
        return of<CompleteProps<T>>(defaultCompleteProps)
      } else if (complete && prevChildProps && Array.isArray(prevPaths) && equals(prevPaths, paths)) {
        subject.next(prevChildProps)
        return query$
      }

      complete = false
      return from(progressive ?
        model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Partial<T>>> :
        model.get(...paths) as unknown as Subscribable<JSONEnvelope<Partial<T>>>
      ).pipe(
        map<JSONEnvelope<Partial<T>>, NextProps<T>>(({ json }) => ({ fragment: json, status: 'next' })),
        startWithSynchronous(defaultNextProps),
        endWithSynchronous<NextProps<T> | CompleteProps<T>>((envelope) => envelope === undefined ? defaultCompleteProps : { fragment: envelope.fragment, status: 'complete' }),
        catchError<ChildProps<T>, Observable<ChildProps<T>>>(errorHandler),
        repeatWhen<ChildProps<T>>(() => graphChange$),
        multicast(subject),
        refCount(), // TODO - replace with shareReplay or publishReplay?: https://itnext.io/the-magic-of-rxjs-sharing-operators-and-their-differences-3a03d699d255
        tap((_prevChildProps) => prevChildProps = _prevChildProps),
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
//   graphChange$: Observable<void>,
//   { errorHandler = defaultErrorHandler, equals = deepEquals }: Options = {}
// ) => <F extends Fragment = Fragment>(pathSets$: Observable<PathSet[] | Error | null>): Observable<ChildProps<T>> => {
//   let complete = false
//   let prevChildProps: ChildProps<T> = { fragment: {}, status: 'complete' }

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
//         of(prevChildProps)
//       }

//       complete = false
//       return from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Partial<T>>>).pipe(
//         map(({ json }) => ({ fragment: json, status: 'next' })),
//         startWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'next' })),
//         endWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'complete' })),
//         catchError(errorHandler),
//         repeatWhen(() => graphChange$),
//         tap((result) => prevChildProps = result),
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
//   graphChange$: Observable<void>,
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
