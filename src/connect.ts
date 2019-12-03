import { Observable, of, from, Subscribable, ReplaySubject } from 'rxjs'
import { PathSet, Model, JSONEnvelope } from 'falcor'
import { equals as deepEquals } from 'ramda'
import { TypedFragment, ErrorProps, ChildProps } from './types'
import { catchError, repeatWhen, map, refCount, multicast, scan, distinctUntilChanged, bufferCount, startWith, switchAll, tap } from 'rxjs/operators'
import { switchAll as _switchAll } from './rxjs/switchAll'
import { startWithSynchronous } from './rxjs/startWithSynchronous'
import { endWithSynchronous } from './rxjs/endWithSynchronous'


export type Options = {
  errorHandler?: (error: Error, caught?: Observable<any>) => Observable<ErrorProps>
  equals?: (prev: PathSet[], next: PathSet[]) => boolean
}


export const defaultErrorHandler = (error: Error) => {
  console.error(error)
  return of<ErrorProps>({
    graphFragment: {}, status: 'error', error: error instanceof Error ? error : new Error(error)
  })
}


export const connect = (
  model: Model,
  graphChange$: Observable<undefined>,
  { errorHandler = defaultErrorHandler, equals = deepEquals }: Options = {}
) => <Fragment = TypedFragment>(pathSets$: Observable<PathSet[] | Error | null>): Observable<ChildProps<Fragment>> => {
  const defaultNextProps: ChildProps<Fragment> = { graphFragment: {}, status: 'next' }
  const defaultCompleteProps: ChildProps<Fragment> = { graphFragment: {}, status: 'complete' }
  const subject = new ReplaySubject<ChildProps<Fragment>>(1)
  let _result: ChildProps<Fragment> | undefined

  return pathSets$.pipe(
    startWith([]),
    bufferCount(2, 1),
    scan((query$, [prevPaths, paths]) => {
      if (paths instanceof Error) {
        return of<ChildProps<Fragment>>({ graphFragment: {}, status: 'error', error: paths })
      } else if (paths === null) {
        return of<ChildProps<Fragment>>(defaultNextProps)
      } else if (paths.length === 0) {
        return of<ChildProps<Fragment>>(defaultCompleteProps)
      } else if (prevPaths !== null && !(prevPaths instanceof Error) && equals(prevPaths, paths) && _result !== undefined) {
        subject.next(_result)
        return query$
      }

      return from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Partial<Fragment>>>).pipe(
        map(({ json }) => ({ graphFragment: json, status: 'next' })),
        startWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'next' })),
        endWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'complete' })),
        catchError(errorHandler),
        repeatWhen(() => graphChange$),
        multicast(subject),
        refCount(),
        tap((result) => _result = result)
      )
    }, of<ChildProps<Fragment>>({ graphFragment: {}, status: 'complete' })),
    distinctUntilChanged(),
    switchAll()
  )
}

/**
 * Connect without memoizing output based on input paths
 */
// export const connect = (
//   model: Model,
//   graphChange$: Observable<undefined>,
//   { errorHandler = defaultErrorHandler }: Options = {}
// ) => {
//   const graphChangeHandler = () => graphChange$

//   return <Fragment = TypedFragment>(
//     pathSets$: Observable<PathSet[] | Error | null>
//   ): Observable<ChildProps<Fragment>> => pathSets$.pipe(
//     switchMap((paths) => {
//       if (paths instanceof Error) {
//         return of({ graphFragment: {}, status: 'error', error: paths })
//       } else if (paths === null) {
//         return of({ graphFragment: {}, status: 'next' })
//       } else if (paths.length === 0) {
//         return of({ graphFragment: {}, status: 'complete' })
//       }

//       return from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Partial<Fragment>>>).pipe(
//         map(({ json }) => ({ graphFragment: json, status: 'next' })),
//         startWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'next' })),
//         endWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'complete' })),
//         catchError(errorHandler),
//         repeatWhen(graphChangeHandler)
//       )
//     })
//   )
// }
