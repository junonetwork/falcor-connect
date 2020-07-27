import { Model, PathSet } from 'falcor'
import { Observable, combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'
import { Fragment, ChildProps } from '../types'
import { mapPropsStream } from '../mapPropsStream'
import { connect, Options } from '../connect'


export const WithFalcor = (model: Model, graphChange$: Observable<void>, options: Options = {}) => {
  const connectedModel = connect(model, graphChange$, options)

  return <Props, F extends Fragment = Fragment>(
    paths: PathSet[] | Error | null | ((props: Props) => PathSet[] | Error | null),
  ) => mapPropsStream<ChildProps<F> & Props, Props>((props$) => combineLatest(
    props$,
    props$.pipe(
      map((props) => typeof paths === 'function' ? paths(props) : paths),
      connectedModel as (pathSets$: Observable<Error | PathSet[] | null>) => Observable<ChildProps<F>>
    )
  ).pipe(
    map(([props, falcorProps]) => ({ ...falcorProps, ...props }))
  ))
}
