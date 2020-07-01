import { useState } from 'react'
import { from, Subscribable, Observable } from 'rxjs'
import { Model, Path, PathSet, JSONEnvelope } from 'falcor'
import { useStreamCallback } from '..'
import { switchMap, catchError, map } from 'rxjs/operators'
import { Options, defaultErrorHandler } from '../connect'
import { startWithSynchronous } from '../rxjs/startWithSynchronous'
import { endWithSynchronous } from '../rxjs/endWithSynchronous'
import { Fragment, ChildProps } from '../types'


// export const UseFalcorCall = (
//   model: Model,
//   { errorHandler = defaultErrorHandler }: Options = {}
// ) => {
//   return <T, F = Fragment>(
//     path: (data: T) => Path,
//     args?: (data: T) => any[],
//     refPaths?: (data: T) => PathSet[],
//     thisPaths?: (data: T) => PathSet[],
//     observer?: PartialObserver<JSONEnvelope<F>>
//   ) => {
//     return useStreamCallback<T, JSONEnvelope<F>>(
//       (stream$) => stream$.pipe(
//         switchMap((data) => {
//           return model.call(
//             path(data),
//             args ? args(data) : [],
//             refPaths ? refPaths(data) : [],
//             thisPaths ? thisPaths(data) : []
//           ) as unknown as Observable<JSONEnvelope<F>>
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
  return <T = void, F extends Fragment = Fragment>(
    path: (data: T) => Path,
    args?: (data: T) => unknown[],
    refPaths?: (data: T) => PathSet[],
    thisPaths?: (data: T) => PathSet[],
  ): ChildProps<F> & { handler: (data: T) => void } => {
    const [props, setState] = useState<ChildProps<F>>({ status: 'complete', fragment: {} })

    const handler = useStreamCallback<T, ChildProps<F>>(
      (stream$) => stream$.pipe(
        switchMap((data) => {
          return from(model.call(
            path(data),
            args ? args(data) : [],
            refPaths ? refPaths(data) : [],
            thisPaths ? thisPaths(data) : []
          ) as unknown as Subscribable<JSONEnvelope<Partial<F>>>).pipe(
            map<JSONEnvelope<Partial<F>>, ChildProps<F>>(({ json }) => ({ fragment: json, status: 'next' as const })),
            startWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'next' as const })),
            endWithSynchronous((envelope) => ({ fragment: envelope === undefined ? {} : envelope.fragment, status: 'complete' as const })),
            catchError<ChildProps<F>, Observable<ChildProps<F>>>(errorHandler),
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
