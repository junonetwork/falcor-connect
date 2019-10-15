import { Observable, zip, from, Subscribable, of } from 'rxjs'


/**
 * Project source observable next and complete emits.  If source emits and completes synchronously, then target only emits the projected complete emit.
 * TODO - how to ensure projectNext is not called if observable is synchronously completed?
 * TODO - would it make more sense to call this mapComplete and pair it w/ a regular map and startWithSync?
 * 
 * @param projectNext 
 * @param projectComplete 
 * @param defaultSynchronousNext 
 */
export const mapSynchronous = <T, R>(
  projectNext: (data: T) => R,
  projectComplete: (data: T) => R,
  defaultSynchronousNext?: R,
  defaultComplete?: R,
) => (stream$: Observable<T>): Observable<R> => {
  return new Observable<R>((observer) => {
    let complete = false
    let sync = true
    let data: T | undefined

    const subscription = stream$.subscribe(
      (emit) => {
        data = emit

        if (!sync) {
          observer.next(projectNext(data))
        }
      },
      (error) => observer.error(error),
      () => {
        complete = true

        if (!sync) {
          if (data !== undefined) {
            observer.next(projectComplete(data))
          } else if (defaultComplete) {
            observer.next(defaultComplete)
          }
          observer.complete()
        }
      }
    )

    sync = false

    if (data !== undefined && complete) {
      // emits next and complete synchronously
      observer.next(projectComplete(data))
      observer.complete()
    } else if (complete) {
      // emits complete synchronously
      if (defaultComplete) observer.next(defaultComplete)
      observer.complete()
    } else if (data !== undefined) {
      // emits next synchronously
      observer.next(projectNext(data))
    } else {
      // no synchronous emit
      if (defaultSynchronousNext !== undefined) observer.next(defaultSynchronousNext)
    }

    return subscription
  })
}
