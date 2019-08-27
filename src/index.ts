import { of, merge, from, empty, Observable, Subscribable } from 'rxjs'
import { switchMap, startWith, map, catchError, repeatWhen, auditTime, last } from 'rxjs/operators'
import { PathSet, Model } from 'falcor'


export type FalcorList<Item> = { length: number } & { [key: string]: Item }

export type Options<Props, Fragment extends {}> = {
  errorHandler?: (error: string, props: Props, caught?: Observable<ChildProps<Props, Fragment>>) => Observable<ChildProps<Props, Fragment>>
}

export type ChildProps<Props, Fragment> = Props & {
  graphFragment: Fragment
  graphFragmentStatus: 'complete' | 'next' | 'error'
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
  ...props, graphFragment: {} as Fragment, graphFragmentStatus: 'error', error,
})


export const connect = (model: Model, graphChange$: Observable<undefined>) => <Props, Fragment extends {}>(
  paths: PathSet[] | ((props: Props) => PathSet[]),
  { errorHandler = defaultErrorHandler }: Options<Props, Fragment> = {}
) => (props$: Observable<Props>): Observable<ChildProps<Props, Fragment | {}>> => (
    props$.pipe(
      // valid optimization?
      // map(props => Object.assign(props, { path: typeof paths === 'function' ? paths(props) : paths}))
      // distinctUntilChanged(({ path }, { path: nextPath }) => shallowEquals(path, nextPath))
      switchMap((props) => {
        const _paths: PathSet[] = typeof paths === 'function' ? paths(props) : paths
  
        if (_paths === null || _paths.length === 0) {
          return of({ ...props, graphFragment: {}, graphFragmentStatus: 'complete' as 'complete' })
        } else if (_paths instanceof Error) {
          return of({
            ...props, graphFragment: {}, graphFragmentStatus: 'error' as 'error', error: _paths.message,
          })
        }
  
        if (!isPaths(_paths)) {
          console.error(
            'Expected an array of paths, e.g [["todos", 0, "title"],["todos", "length"]].  Received:',
            _paths
          )
          return of({
            ...props,
            graphFragment: {},
            graphFragmentStatus: 'error' as 'error',
            error: `Expected an array of paths, e.g [["todos", 0, "title"],["todos", "length"]].  Received ${JSON.stringify(_paths)}`,
          })
        }
  
        // single emit
        // return from(model.get(..._paths) as any as Subscribable<Fragment>).pipe(
        //   map((graphFragment) => ({ ...props, graphFragment, graphFragmentStatus: 'complete' as 'complete' })),
        //   startWith(({ ...props, graphFragment: {}, graphFragmentStatus: 'next' as 'next' })),
        //   catchError((err) => errorHandler(err.toString(), props)),
        //   repeatWhen(() => graphChange$),
        //   auditTime(0)
        // )

        // progressive emit
        const graphQuery$ = from(model.get(..._paths).progressively() as any as Subscribable<Fragment>) // TODO - do we need a compatability shim?
  
        return merge(
          graphQuery$.pipe(
            startWith({}),
            map((graphFragment) => ({ ...props, graphFragment, graphFragmentStatus: 'next' as 'next' })),
            catchError((err) => errorHandler(err.toString(), props))
          ),
          graphQuery$.pipe(
            last(),
            catchError(() => empty()),
            map((graphFragment) => ({ ...props, graphFragment, graphFragmentStatus: 'complete' as 'complete' }))
          )
        ).pipe(
          repeatWhen(() => graphChange$),
          auditTime(0)
        )
      })
    )
  )
