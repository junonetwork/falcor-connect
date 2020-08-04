import { ComponentType, createElement } from 'react'
import { Model, PathSet } from 'falcor'
import { Observable } from 'rxjs'
import { Fragment, ChildProps } from '../types'
import { Options } from '../connect'
import { UseFalcor } from '../hook/useFalcor'


export const WithFalcor = (model: Model, graphChange$: Observable<void>, options: Options = {}) => {
  const useFalcor = UseFalcor(model, graphChange$, options)

  return <Props, F extends Fragment = Fragment>(
    paths: PathSet[] | Error | null | ((props: Props) => PathSet[] | Error | null),
  ) => (wrappedComponent: ComponentType<ChildProps<F> & Props>) => {
    return (props: Props) => {
      const falcorProps = useFalcor<F>(typeof paths === 'function' ? paths(props) : paths)
      return createElement(wrappedComponent, { ...props, ...falcorProps })
    }
    /**
     * alternatively
     * return memo((props: Props) => {
     *   const falcorProps = useFalcor<F>(typeof paths === 'function' ? paths(props) : paths)
     *   return createElement(wrappedComponent, { ...props, ...falcorProps })
     * })
     *
     * return (props: Props) => {
     *   const falcorProps = useFalcor<F>(typeof paths === 'function' ? paths(props) : paths)
     *   return useMemo(() => createElement(wrappedComponent, { ...props, ...falcorProps }), Object.values({ ...props, ...falcorProps }))
     * }
     */
  }
}


// export const WithFalcor = (model: Model, graphChange$: Observable<void>, options: Options = {}) => {
//   const connectedModel = connect(model, graphChange$, options)

//   return <Props, F extends Fragment = Fragment>(
//     paths: PathSet[] | Error | null | ((props: Props) => PathSet[] | Error | null),
//   ) => mapPropsStream<ChildProps<F> & Props, Props>((props$) => combineLatest(
//     props$,
//     props$.pipe(
//       map((props) => typeof paths === 'function' ? paths(props) : paths),
//       connectedModel as (pathSets$: Observable<Error | PathSet[] | null>) => Observable<ChildProps<F>>
//     )
//   ).pipe(
//     map(([props, falcorProps]) => ({ ...props, ...falcorProps }))
//   ))
// }
