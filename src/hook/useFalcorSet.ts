import { from, Subscribable } from 'rxjs'
import { Model, PathValue, JSONEnvelope } from 'falcor'
import { useStreamCallback } from '..'
import { switchMap, catchError, map } from 'rxjs/operators'
import { useState } from 'react'
import { TypedFragment, ChildProps } from '../types'
import { Options, defaultErrorHandler } from '../connect'
import { startWithSynchronous } from '../rxjs/startWithSynchronous'
import { endWithSynchronous } from '../rxjs/endWithSynchronous'


// export const UseFalcorSet = (
//   model: Model,
//   { errorHandler = defaultErrorHandler }: Options = {}
// ) => {
//   return <T, Fragment = TypedFragment>(
//     pathValue: (data: T) => PathValue[],
//     observer?: PartialObserver<JSONEnvelope<Fragment>>
//   ) => {
//     return useStreamCallback<T, JSONEnvelope<Fragment>>(
//       (stream$) => stream$.pipe(
//         switchMap((data) => {
//           return from(model.set(...pathValue(data)) as unknown as Observable<JSONEnvelope<Fragment>>)
//         }),
//         catchError(errorHandler),
//       ),
//       observer
//     )
//   }
// }

export const UseFalcorSet = (
  model: Model,
  { errorHandler = defaultErrorHandler }: Options = {}
) => {
  return <T, Fragment = TypedFragment>(pathValue: (data: T) => PathValue[]): ChildProps<Fragment> & { handler: (data?: T) => void } => {
    const [props, setState] = useState<ChildProps<Fragment>>({ status: 'complete', graphFragment: {} })

    const handler = useStreamCallback<T, ChildProps<Fragment>>(
      (stream$) => stream$.pipe(
        switchMap((data) => {
          return from(model.set(...pathValue(data)) as unknown as Subscribable<JSONEnvelope<Partial<Fragment>>>).pipe(
            map(({ json }) => ({ graphFragment: json, status: 'next' })),
            startWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'next' })),
            endWithSynchronous((envelope) => ({ graphFragment: envelope === undefined ? {} : envelope.graphFragment, status: 'complete' })),
            catchError(errorHandler),
          )
        }),
      ),
      { next: (props) => setState(props) }
    )

    return {
      ...props,
      handler,
    }
  }
}
