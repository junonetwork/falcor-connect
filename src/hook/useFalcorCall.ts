import { from, Subscribable } from 'rxjs'
import { Model, Path, PathSet, JSONEnvelope } from 'falcor'
import { useStreamCallback, TypedFragment, ChildProps } from '..'
import { switchMap, catchError, map } from 'rxjs/operators'
import { Options, defaultErrorHandler } from '../connect'
import { startWithSynchronous } from '../rxjs/startWithSynchronous'
import { endWithSynchronous } from '../rxjs/endWithSynchronous'
import { useState } from 'react'


// export const UseFalcorCall = (
//   model: Model,
//   { errorHandler = defaultErrorHandler }: Options = {}
// ) => {
//   return <T, Fragment = TypedFragment>(
//     path: (data: T) => Path,
//     args?: (data: T) => any[],
//     refPaths?: (data: T) => PathSet[],
//     thisPaths?: (data: T) => PathSet[],
//     observer?: PartialObserver<JSONEnvelope<Fragment>>
//   ) => {
//     return useStreamCallback<T, JSONEnvelope<Fragment>>(
//       (stream$) => stream$.pipe(
//         switchMap((data) => {
//           return model.call(
//             path(data),
//             args ? args(data) : [],
//             refPaths ? refPaths(data) : [],
//             thisPaths ? thisPaths(data) : []
//           ) as unknown as Observable<JSONEnvelope<Fragment>>
//         }),
//         catchError(errorHandler),
//       ),
//       observer
//     )
//   }
// }


export const UseFalcorCall = (
  model: Model,
  { errorHandler = defaultErrorHandler }: Options = {}
) => {
  return <T, Fragment = TypedFragment>(
    path: (data: T) => Path,
    args?: (data: T) => any[],
    refPaths?: (data: T) => PathSet[],
    thisPaths?: (data: T) => PathSet[],
  ): ChildProps<Fragment> & { handler: (data?: T) => void } => {
    const [props, setState] = useState<ChildProps<Fragment>>({ status: 'complete', graphFragment: {} })

    const handler = useStreamCallback<T, ChildProps<Fragment>>(
      (stream$) => stream$.pipe(
        switchMap((data) => {
          return from(model.call(
            path(data),
            args ? args(data) : [],
            refPaths ? refPaths(data) : [],
            thisPaths ? thisPaths(data) : []
          ) as unknown as Subscribable<JSONEnvelope<Partial<Fragment>>>).pipe(
            map(({ json }) => ({ graphFragment: json, status: 'next' })),
            startWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'next' })),
            endWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'complete' })),
            catchError(errorHandler),
          )
        })
      ),
      { next: (props) => setState(props) }
    )

    return {
      ...props,
      handler,
    }
  }
}
