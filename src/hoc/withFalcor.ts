import { Model, PathSet } from 'falcor'
import { Observable, combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'
import { Fragment, ChildProps } from '../types'
import { mapPropsStream } from '../mapPropsStream'
import { connect, Options } from '../connect'


export const WithFalcor = <Props, F extends Fragment = Fragment>(model: Model, graphChange$: Observable<undefined>, options: Options = {}) => {
  const connectedModel = connect(model, graphChange$, options)

  return (
    paths: PathSet[] | Error | null | ((props: Props) => PathSet[] | Error | null),
  ) => mapPropsStream<ChildProps<F> & Props, Props>((props$) => combineLatest(
    props$,
    props$.pipe(
      map((props) => typeof paths === 'function' ? paths(props) : paths),
      connectedModel
    )
  ).pipe(
    map(([props, falcorProps]) => ({ ...falcorProps, ...props }))
  ))
}
