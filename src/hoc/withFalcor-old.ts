import { of, merge, from, empty, Observable, Subscribable, Subject, Subscription, pipe } from 'rxjs'
import { switchMap, startWith, map as mapRx, catchError, repeatWhen, auditTime, last } from 'rxjs/operators'
import { PathSet, Model, JSONEnvelope } from 'falcor'
import { ComponentType, createElement, Component } from 'react'
import { Fragment, ChildProps, ErrorProps } from '../types'
import { isPathSets } from '../utils'


export type Options<Props> = {
  errorHandler?: (error: Error, props: Props, caught?: Observable<Props & ErrorProps>) => Observable<Props & ErrorProps>
}

const defaultErrorHandler = <Props>(error: Error, props: Props): Observable<ErrorProps & Props> => of({
  ...props, fragment: {}, status: 'error', error,
})


export const connect = (model: Model, graphChange$: Observable<undefined>) => <Props, F extends Partial<Fragment> = Partial<Fragment>>(
  paths: PathSet[] | ((props: Props) => PathSet[] | Error | null),
  { errorHandler = defaultErrorHandler }: Options<Props> = {}
) => (props$: Observable<Props>): Observable<Props & ChildProps<F>> => (
    props$.pipe(
      switchMap((props) => {
        const _paths: PathSet[] | Error | null = typeof paths === 'function' ? paths(props) : paths

        if (_paths instanceof Error) {
          return of({ ...props, fragment: {}, status: 'error' as const, error: _paths })
        } else if (_paths === null) {
          return of({ ...props, fragment: {}, status: 'next' as const })
        } else if (_paths.length === 0) {
          return of({ ...props, fragment: {}, status: 'complete' as const })
        }

        if (!isPathSets(_paths)) {
          console.error(
            'Expected an array of paths, e.g [["todos", 0, "title"],["todos", "length"]].  Received:',
            _paths
          )
          return of({
            ...props,
            fragment: {},
            status: 'error' as const,
            error: new Error(`Expected an array of paths, e.g [["todos", 0, "title"],["todos", "length"]].  Received ${JSON.stringify(_paths)}`),
          })
        }

        // single emit
        // return from(model.get(..._paths) as any as Subscribable<JSONEnvelope<F>>).pipe(
        //   map((fragment) => ({ ...props, fragment, status: 'complete' as const })),
        //   startWith(({ ...props, fragment: {}, status: 'next' as const })),
        //   catchError((err) => errorHandler(err.toString(), props)),
        //   repeatWhen(() => graphChange$),
        //   auditTime(0)
        // )

        // progressive emit
        const graphQuery$ = from(model.get(..._paths).progressively() as unknown as Subscribable<JSONEnvelope<F>>) // TODO - do we need a compatability shim?

        /**
         * how to ensure
         * - if none of request is in cache, emits 2 (empty next, complete)
         * - if some of request is in cache, emits 2 (partial next, complete)
         * - if all of request is in cache, emits 1 (complete)
         */
        return merge(
          graphQuery$.pipe(
            startWith({}),
            mapRx((fragment) => ({ ...props, fragment, status: 'next' as const })),
            catchError((err) => errorHandler(err, props))
          ),
          graphQuery$.pipe(
            last(),
            catchError(() => empty()),
            mapRx((fragment) => ({ ...props, fragment, status: 'complete' as const }))
          )
        ).pipe(
          repeatWhen(() => graphChange$),
          auditTime(0)
        )
      })
    )
  )


export const mapPropsStream = <InnerProps, OutterProps>(
  project: (props$: Observable<OutterProps>) => Observable<InnerProps>
) => (wrappedComponent: ComponentType<InnerProps>) => {
    return class MapPropsStream extends Component<OutterProps> {

    state: { mappedProps: InnerProps | undefined } = { mappedProps: undefined }
    props$ = new Subject<OutterProps>()
    subscription!: Subscription

    componentDidMount() {
      this.subscription = this.props$.pipe(startWith(this.props), project).subscribe((mappedProps) => {
        this.setState({ mappedProps })
      })
    }

    UNSAFE_componentWillReceiveProps(nextProps: OutterProps) {
      this.props$.next(nextProps)
    }

    shouldComponentUpdate(props: OutterProps, state: { mappedProps: InnerProps | undefined }) {
      return this.state.mappedProps !== state.mappedProps
    }

    componentWillUnmount() {
      this.subscription.unsubscribe()
    }

    render() {
      return this.state.mappedProps === undefined ?
        null :
        createElement(wrappedComponent, this.state.mappedProps)
    }
    }
  }


export const ComposeFalcor = (model: Model, graphChange$: Observable<undefined>) => {
  const connectedModel = connect(model, graphChange$)

  return <Props, F extends Partial<Fragment> = Partial<Fragment>>(
    fn1: (PathSet[] | ((props: Props) => PathSet[] | Error)),
    ...restFn: Array<((props: Props & { status: 'complete', fragment: JSONEnvelope<F> }) => PathSet[] | Error)>
  ) => {
    return mapPropsStream(pipe(
      connectedModel<Props, F>(fn1),
      ...restFn.map((fn) => connectedModel<Props, F>((props: Props & ChildProps<F>) => {
        if (props.status === 'error') {
          return props.error instanceof Error ? props.error : new Error(props.error)
        } else if (props.status === 'next') {
          return null
        }

        return fn(props as Props & { status: 'complete', fragment: JSONEnvelope<F> })
      })) as []
    ))
  }
}


export const WithFalcor = (model: Model, graphChange$: Observable<undefined>) => {
  const connectedModel = connect(model, graphChange$)

  return <Props, F extends Partial<Fragment> = Partial<Fragment>>(
    paths: PathSet[] | ((props: Props) => PathSet[] | Error),
    options: Options<Props> = {}
  ) => mapPropsStream(connectedModel<Props, F>(paths, options))
}
