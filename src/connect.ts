import { Observable, of, from, Subscribable } from 'rxjs'
import { PathSet, Model, JSONEnvelope } from 'falcor'
import { TypedFragment, ErrorProps, ChildProps } from './types'
import { catchError, repeatWhen, map, switchMap } from 'rxjs/operators'
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
  { errorHandler = defaultErrorHandler }: Options = {}
) => {
  const graphChangeHandler = () => graphChange$

  return <Fragment = TypedFragment>(
    pathSets$: Observable<PathSet[] | Error | null>
  ): Observable<ChildProps<Fragment>> => pathSets$.pipe(
    switchMap((paths) => {
      if (paths instanceof Error) {
        return of({ graphFragment: {}, status: 'error', error: paths })
      } else if (paths === null) {
        return of({ graphFragment: {}, status: 'next' })
      } else if (paths.length === 0) {
        return of({ graphFragment: {}, status: 'complete' })
      }

      return from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Partial<Fragment>>>).pipe(
        map(({ json }) => ({ graphFragment: json, status: 'next' })),
        startWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'next' })),
        endWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'complete' })),
        catchError(errorHandler),
        repeatWhen(graphChangeHandler)
      )
    })
  )
}


// export const connect2 = (
//   model: Model,
//   graphChange$: Observable<undefined>,
//   { errorHandler = defaultErrorHandler, equals = deepEquals }: Options = {}
// ) => {
//   const graphChangeHandler = () => graphChange$

//   return <Fragment = TypedFragment>(
//     pathSets$: Observable<PathSet[] | Error | null>
//   ): Observable<ChildProps<Fragment>> => pathSets$.pipe(
//     scan<PathSet[] | Error | null, { query$: Observable<ChildProps<Fragment>>, paths: PathSet[] | Error | null }>((acc, paths) => {
//       if (paths instanceof Error) {
//         return { paths, query$: of({ graphFragment: {}, status: 'error', error: paths }) }
//       } else if (paths === null) {
//         return { paths, query$: of({ graphFragment: {}, status: 'next' }) }
//       } else if (paths.length === 0) {
//         return { paths, query$: of({ graphFragment: {}, status: 'complete' }) }
//       }

//       if (!(acc.paths instanceof Error) && acc.paths !== null && equals(paths, acc.paths)) {
//         return acc
//       }

//       return {
//         query$: from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Partial<Fragment>>>).pipe(
//           map(({ json }) => ({ graphFragment: json, status: 'next' })),
//           startWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'next' as 'next' })),
//           endWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'complete' as 'complete' })),
//           catchError(errorHandler),
//           repeatWhen(graphChangeHandler),
//           multicast(() => new ReplaySubject<ChildProps<Fragment>>(1)),
//           refCount(),
//         ),
//         paths
//       }
//     }, { query$: of({ graphFragment: {}, status: 'complete' }), paths: [] }),
//     map(({ query$ }) => query$),
//     _switchAll()
//     /**
//      * how to flatten new query$s, while simply reemitting the most recent value from the unchanged query$s?
//      */
//     // startWith(of<ChildProps<Fragment>>({ graphFragment: {}, status: 'complete' })),
//     // bufferCount(2, 1),
//     // switchMap(([prevQuery$, query$]) => {
//     //   if (prevQuery$ === query$) {
//     //     console.log('EQUAL')
//     //     return query$
//     //   }

//     //   return query$
//     // })
//     // (stream$) => {
//     //   return new Observable((observer) => {
//     //     let prevQuery$: Observable<ChildProps<Fragment>> | undefined
//     //     let prevSubscription: SubscriptionLike | undefined

//     //     return stream$.subscribe({
//     //       next: (query$) => {
//     //         if (query$ === prevQuery$) {
//     //           console.log('EQUAL')
//     //         } else {
//     //           if (prevSubscription !== undefined) {
//     //             prevSubscription.unsubscribe()
//     //           }
  
//     //           prevQuery$ = query$
//     //           prevSubscription = query$.subscribe(observer)
//     //         }
//     //       },
//     //       error: (err) => observer.error(err),
//     //       complete: () => observer.complete()
//     //     })
//     //   })
//     // }
//     // switchAll()
//   )
// }
