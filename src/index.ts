import { of, merge, from, empty, Observable, Subscribable, Subject } from 'rxjs'
import { switchMap, startWith, map, catchError, repeatWhen, auditTime, last } from 'rxjs/operators'
import { PathSet, Model } from 'falcor'
import { ComponentType, useState, useRef, useEffect, createElement } from 'react'


export type FalcorList<Item> = { length: number } & { [key: string]: Item }

export type Options<Props, Fragment extends {}> = {
  errorHandler?: (error: string, props: Props, caught?: Observable<ChildProps<Props, Fragment>>) => Observable<ChildProps<Props, Fragment>>
}

export type ChildProps<Props, Fragment> = Props & {
  graph: Fragment
  status: 'complete' | 'next' | 'error'
  error?: string
}


const isPaths = (paths: PathSet[]) => {
  if (!Array.isArray(paths)) {
    return false
  }

  if (paths.length === 0) {
    return false
  }

  for (let i = 0; i < paths.length; i += 1) {
    if (!Array.isArray(paths[i])) {
      return false
    }
  }

  return true
}


const defaultErrorHandler = <Props, Fragment = {}>(error: string, props: Props): Observable<ChildProps<Props, Fragment>> => of({
  ...props, graph: {} as Fragment, status: 'error', error,
})


export const connect = (model: Model, graphChange$: Observable<undefined>) => <Props, Fragment extends {}>(
  paths: PathSet[] | ((props: Props) => PathSet[] | Error),
  { errorHandler = defaultErrorHandler }: Options<Props, Fragment> = {}
) => (props$: Observable<Props>): Observable<ChildProps<Props, Fragment | {}>> => (
    props$.pipe(
      switchMap((props) => {
        const _paths: PathSet[] | Error = typeof paths === 'function' ? paths(props) : paths
  
        if (_paths instanceof Error) {
          return of({ ...props, graph: {}, status: 'error' as 'error', error: _paths.message })
        } else if (_paths === null || _paths.length === 0) {
          return of({ ...props, graph: {}, status: 'complete' as 'complete' })
        }
  
        if (!isPaths(_paths)) {
          console.error(
            'Expected an array of paths, e.g [["todos", 0, "title"],["todos", "length"]].  Received:',
            _paths
          )
          return of({
            ...props,
            graph: {},
            status: 'error' as 'error',
            error: `Expected an array of paths, e.g [["todos", 0, "title"],["todos", "length"]].  Received ${JSON.stringify(_paths)}`,
          })
        }
  
        // single emit
        // return from(model.get(..._paths) as any as Subscribable<Fragment>).pipe(
        //   map((graph) => ({ ...props, graph, status: 'complete' as 'complete' })),
        //   startWith(({ ...props, graph: {}, status: 'next' as 'next' })),
        //   catchError((err) => errorHandler(err.toString(), props)),
        //   repeatWhen(() => graphChange$),
        //   auditTime(0)
        // )

        // progressive emit
        const graphQuery$ = from(model.get(..._paths).progressively() as any as Subscribable<Fragment>) // TODO - do we need a compatability shim?
  
        /**
         * how to ensure
         * - if none of request is in cache, emits 2 (empty next, complete)
         * - if some of request is in cache, emits 2 (partial next, complete)
         * - if all of request is in cache, emits 1 (complete)
         */
        return merge(
          graphQuery$.pipe(
            startWith({}),
            map((graph) => ({ ...props, graph, status: 'next' as 'next' })),
            catchError((err) => errorHandler(err.toString(), props))
          ),
          graphQuery$.pipe(
            last(),
            catchError(() => empty()),
            map((graph) => ({ ...props, graph, status: 'complete' as 'complete' }))
          )
        ).pipe(
          repeatWhen(() => graphChange$),
          auditTime(0)
        )
      })
    )
  )

export const WithFalcor = (model: Model, graphChange$: Observable<undefined>) => {
  const connectedModel = connect(model, graphChange$)

  return <Props, Fragment extends {}>(
    paths: PathSet[] | ((props: Props) => PathSet[] | Error),
    options: Options<Props, Fragment> = {}
  ) => (wrappedComponent: ComponentType<ChildProps<Props, Fragment | {}>>) => (props: Props) => {
    const [mappedProps, setMappedProps] = useState<ChildProps<Props, Fragment | {}> | null>(null)

    const { current: props$ } = useRef(new Subject<Props>())

    useEffect(() => {
      const subscription = props$.pipe(connectedModel(paths, options)).subscribe(setMappedProps)
      return () => subscription.unsubscribe()
    }, [])

    useEffect(() => props$.next(props), [props])

    return mappedProps === null ?
      null :
      createElement(wrappedComponent, mappedProps)
  }
}

export const UseFalcor = (model: Model, graphChange$: Observable<undefined>) => {
  const connectedModel = connect(model, graphChange$)

  return <Fragment extends {}>(
    paths: PathSet[],
    options: Options<{ paths: PathSet[] }, Fragment> = {}
  ): ChildProps<{ paths: PathSet[] }, Fragment | {}> => {
    const [falcorState, setFalcor] = useState<ChildProps<{ paths: PathSet[] }, Fragment | {}>>({
      paths, graph: {}, status: 'next' as 'next'
    })

    const { current: props$ } = useRef(new Subject<{ paths: PathSet[] }>())

    useEffect(() => {
      const subscription = props$.pipe(connectedModel(({ paths }) => paths, options)).subscribe(setFalcor)
      return () => subscription.unsubscribe()
    }, [])

    useEffect(() => props$.next({ paths }), [paths])

    return falcorState
  }
}
