import { Model, PathSet, JSONEnvelope } from 'falcor'
import { startWithSynchronous } from './rxjs/startWithSynchronous'
import { mapComplete } from './rxjs/mapComplete'
import { Observable, zip, from, Subscribable, of, Subject, Subscription } from 'rxjs'
import { switchMap, map, catchError, repeatWhen, distinctUntilChanged, startWith } from 'rxjs/operators'
import { TypedFragment, ErrorProps } from './index'
import { createElement, ComponentType, Component } from 'react'


export type NextProps<Fragment extends Partial<TypedFragment> = Partial<TypedFragment>> = { status: 'next', graphFragment: JSONEnvelope<Fragment> | {} }
export type CompleteProps<Fragment extends Partial<TypedFragment> = Partial<TypedFragment>> = { status: 'complete', graphFragment: JSONEnvelope<Fragment> | {} }
export type ErrorProps = { status: 'error', graphFragment: {}, error: Error }
export type ChildProps<Fragment extends Partial<TypedFragment> = Partial<TypedFragment>> = NextProps<Fragment> | CompleteProps<Fragment> | ErrorProps

export type Options<Props> = {
  errorHandler?: (error: Error, caught?: Observable<Props & ErrorProps>) => Observable<ErrorProps>;
}


export const defaultErrorHandler = (error: Error): Observable<ErrorProps> => of({
  graphFragment: {}, status: 'error', error,
})


export const mapPropsStream = <InnerProps, OutterProps>(
  project: (props$: Observable<OutterProps>) => Observable<InnerProps>
) => (wrappedComponent: ComponentType<InnerProps>) =>
  class MapPropsStream extends Component<OutterProps> {
    
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



export const connect = (
  model: Model,
  graphChange$: Observable<undefined>
) => <Props, Fragment extends Partial<TypedFragment> = Partial<TypedFragment>>(
  paths: PathSet[] | ((props: Props) => PathSet[] | Error | null),
  { errorHandler = defaultErrorHandler }: Options<Props> = {}
) => (props$: Observable<Props>) => {
  const projectNext = ({ json: graphFragment }: JSONEnvelope<Fragment>): ChildProps<Fragment> => ({ status: 'next', graphFragment })
  const projectComplete = ({ graphFragment }: ChildProps<Fragment>): ChildProps<Fragment> => ({ status: 'complete', graphFragment })
  const defaultComplete = { graphFragment: {}, status: 'complete' }
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
          startWithSynchronous({ json: {} }),
          map(projectNext),
          mapComplete(projectComplete, defaultComplete),
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
