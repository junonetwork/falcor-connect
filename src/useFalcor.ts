import { Observable, of, from, Subscribable } from 'rxjs'
import { PathSet, Model, JSONEnvelope } from 'falcor'
import { TypedFragment, ErrorProps, NextProps, CompleteProps, ChildProps } from './types'
import { useStream } from './useStream'
import { catchError, repeatWhen, map, switchMap } from 'rxjs/operators'
import { mapSynchronous } from './rxjs/mapSynchronous'
import { switchScan } from './rxjs/switchScan'
import { equals as deepEquals } from 'ramda'


export type Options = {
  errorHandler?: (error: Error, caught?: Observable<any>) => Observable<ErrorProps>
  equals?: (prev: PathSet[], next: PathSet[]) => boolean
}


const defaultErrorHandler = (error: Error) => of<ErrorProps>({
  graphFragment: {}, status: 'error', error: error instanceof Error ? error : new Error(error)
})


export const UseFalcor = <Fragment extends Partial<TypedFragment> = Partial<TypedFragment>>(
  model: Model,
  graphChange$: Observable<undefined>,
  { errorHandler = defaultErrorHandler, equals = deepEquals }: Options = {}
) => {
  const projectNext = ({ json: graphFragment }: JSONEnvelope<Fragment>): ChildProps<Fragment> => ({ status: 'next', graphFragment })
  const projectComplete = ({ json: graphFragment }: JSONEnvelope<Fragment>): ChildProps<Fragment> => ({ status: 'complete', graphFragment })
  const defaultNext: NextProps = ({ graphFragment: {}, status: 'next' })
  const defaultComplete: CompleteProps = { graphFragment: {}, status: 'complete' }
  const graphChangeHandler = () => graphChange$

  const connect = (pathSets$: Observable<PathSet[]>): Observable<ChildProps<Fragment>> => pathSets$.pipe(
    switchScan<PathSet[], [ChildProps, PathSet[]]>(([prevProps, prevPaths], paths) => {
      if (equals(paths, prevPaths)) {
        return of([prevProps, prevPaths])
      } else if (paths.length === 0) {
        return of([defaultComplete, paths])
      }

      return from(model.get(...paths).progressively() as any as Subscribable<JSONEnvelope<Fragment>>).pipe(
        mapSynchronous(projectNext, projectComplete, defaultNext, defaultComplete),
        catchError(errorHandler),
        repeatWhen(graphChangeHandler),
        map((props) => [props, paths])
      )
    }, [{ graphFragment: {}, status: 'complete'}, []]),
    map(([props]) => props)
    // switchMap((paths) => paths.length === 0 ?
    //   of(defaultComplete) :
    //   from(model.get(...paths).progressively() as any as Subscribable<JSONEnvelope<Fragment>>).pipe(
    //     mapSynchronous(
    //       projectNext,
    //       projectComplete,
    //       defaultNext,
    //       defaultComplete
    //     ),
    //     catchError(errorHandler),
    //     repeatWhen(graphChangeHandler)
    //   )
    // )
  )

  return (pathSets: PathSet[]) => useStream(connect, pathSets)
}
