import { Observable, Subject, Subscription } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { createElement, ComponentType, Component } from 'react'


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
