import { Model, PathSet, JSONEnvelope } from 'falcor'
import { mapSynchronous } from './rxjs/mapSynchronous'
import { Observable, zip, from, Subscribable, of } from 'rxjs'
import { switchMap, map, catchError, repeatWhen, distinctUntilChanged } from 'rxjs/operators'
import { TypedFragment, ErrorProps, ChildProps, CompleteProps, NextProps } from './types'
import { mapPropsStream } from './mapPropsStream'


export type Options<Props> = {
  errorHandler?: (error: Error, caught?: Observable<Props & ErrorProps>) => Observable<ErrorProps>;
}


const defaultErrorHandler = (error: Error) => of<ErrorProps>({
  graphFragment: {}, status: 'error', error: error instanceof Error ? error : new Error(error)
})


const connect = (
  model: Model,
  graphChange$: Observable<undefined>
) => <Props, Fragment extends Partial<TypedFragment> = Partial<TypedFragment>>(
  paths: PathSet[] | ((props: Props) => PathSet[] | Error | null),
  { errorHandler = defaultErrorHandler }: Options<Props> = {}
) => (props$: Observable<Props>) => {
  const projectNext = ({ json: graphFragment }: JSONEnvelope<Fragment>): ChildProps<Fragment> => ({ status: 'next', graphFragment })
  const projectComplete = ({ json: graphFragment }: JSONEnvelope<Fragment>): ChildProps<Fragment> => ({ status: 'complete', graphFragment })
  const defaultNext: NextProps = ({ graphFragment: {}, status: 'next' })
  const defaultComplete: CompleteProps = { graphFragment: {}, status: 'complete' }
  const graphChangeHandler = () => graphChange$

  return zip(
    props$,
    props$.pipe(
      map((props) => typeof paths === 'function' ? paths(props) : paths),
      distinctUntilChanged(),
      switchMap((paths) => {
        if (paths instanceof Error) {
          return of<ErrorProps>({ graphFragment: {}, status: 'error', error: paths })
        } else if (paths === null) {
          return of<NextProps>({ graphFragment: {}, status: 'next' })
        } else if (paths.length === 0) {
          return of<CompleteProps>({ graphFragment: {}, status: 'complete' })
        }

        return from(model.get(...paths).progressively() as any as Subscribable<JSONEnvelope<Fragment>>).pipe(
          mapSynchronous(
            projectNext,
            projectComplete,
            defaultNext,
            defaultComplete
          ),
          catchError(errorHandler),
          repeatWhen(graphChangeHandler)
        )
      })
    )
  ).pipe(
    map(([props, { status, graphFragment }]) => ({ ...props, status, graphFragment }))
  )
}


export const WithFalcor = (model: Model, graphChange$: Observable<undefined>) => {
  const connectedModel = connect(model, graphChange$)

  return <Props, Fragment extends Partial<TypedFragment> = Partial<TypedFragment>>(
    paths: PathSet[] | ((props: Props) => PathSet[] | Error | null),
    options: Options<Props> = {}
  ) => mapPropsStream(connectedModel<Props, Fragment>(paths, options))
}
