import { Observable, of, from, Subscribable } from 'rxjs'
import { PathSet, Model, JSONEnvelope } from 'falcor'
import { TypedFragment, ErrorProps, NextProps, CompleteProps, ChildProps } from './types'
import { catchError, repeatWhen, map, switchMap } from 'rxjs/operators'
import { mapSynchronous } from './rxjs/mapSynchronous'
import { equals as deepEquals } from 'ramda'


export type Options = {
  errorHandler?: (error: Error, caught?: Observable<any>) => Observable<ErrorProps>
  equals?: (prev: PathSet[], next: PathSet[]) => boolean
}


const defaultErrorHandler = (error: Error) => {
  console.error(error)
  return of<ErrorProps>({
    graphFragment: {}, status: 'error', error: error instanceof Error ? error : new Error(error)
  })
}


/**
 * TODO - how to cache results so that duplicate paths don't call the model twice
 */
// export const connect = <Fragment extends Partial<TypedFragment> = Partial<TypedFragment>>(
//   model: Model,
//   graphChange$: Observable<undefined>,
//   { errorHandler = defaultErrorHandler, equals = deepEquals }: Options = {}
// ) => {
//   const projectNext = ({ json: graphFragment }: JSONEnvelope<Fragment>): ChildProps<Fragment> => ({ status: 'next', graphFragment })
//   const projectComplete = ({ json: graphFragment }: JSONEnvelope<Fragment>): ChildProps<Fragment> => ({ status: 'complete', graphFragment })
//   const defaultNext: NextProps<Fragment> = ({ graphFragment: {}, status: 'next' })
//   const defaultComplete: CompleteProps = { graphFragment: {}, status: 'complete' }
//   const graphChangeHandler = () => graphChange$

//   return (pathSets$: Observable<PathSet[] | Error | null>): Observable<ChildProps<Fragment>> => pathSets$.pipe(
//     switchScan<PathSet[] | Error | null, [ChildProps, PathSet[] | Error | null]>(([prevProps, prevPaths], paths) => {
//       if (paths instanceof Error) {
//         return of([{ graphFragment: {}, status: 'error', error: paths }, paths])
//       } else if (paths === null) {
//         return of([defaultNext, paths])
//       } else if (paths.length === 0) {
//         return of([defaultComplete, paths])
//       } else if (prevPaths instanceof Error || prevPaths === null || equals(paths, prevPaths)) {
//         return of([{ graphFragment: {}, status: 'complete' }, prevPaths])
//       }

//       return from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Fragment>>).pipe(
//         mapSynchronous(projectNext, projectComplete, defaultNext, defaultComplete),
//         catchError(errorHandler),
//         repeatWhen(graphChangeHandler),
//         map((props) => [props, paths])
//       )
//     }, [{ graphFragment: {}, status: 'complete' }, []]),
//     map(([props]) => props)
//   )
// }

export const connect = <Fragment extends Partial<TypedFragment> = Partial<TypedFragment>>(
  model: Model,
  graphChange$: Observable<undefined>,
  { errorHandler = defaultErrorHandler }: Options = {}
) => {
  const projectNext = ({ json: graphFragment }: JSONEnvelope<Fragment>): ChildProps<Fragment> => ({ status: 'next', graphFragment })
  const projectComplete = ({ json: graphFragment }: JSONEnvelope<Fragment>): ChildProps<Fragment> => ({ status: 'complete', graphFragment })
  const defaultNext: NextProps<Fragment> = ({ graphFragment: {}, status: 'next' })
  const defaultComplete: CompleteProps = { graphFragment: {}, status: 'complete' }
  const graphChangeHandler = () => graphChange$

  return (pathSets$: Observable<PathSet[] | Error | null>): Observable<ChildProps<Fragment>> => pathSets$.pipe(
    switchMap((paths) => {
      if (paths instanceof Error) {
        return of([{ graphFragment: {}, status: 'error', error: paths }, paths])
      } else if (paths === null) {
        return of([defaultNext, paths])
      } else if (paths.length === 0) {
        return of([defaultComplete, paths])
      }

      return from(model.get(...paths).progressively() as unknown as Subscribable<JSONEnvelope<Fragment>>).pipe(
        mapSynchronous(projectNext, projectComplete, defaultNext, defaultComplete),
        catchError(errorHandler),
        repeatWhen(graphChangeHandler),
        map((props) => [props, paths])
      )
    }),
    map(([props]) => props)
  )
}
