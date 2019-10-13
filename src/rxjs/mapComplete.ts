import { Observable } from 'rxjs'


/**
 * Project source observable complete emits.  If source emits next and complete synchronously, then target only emits the projected complete emit.
 * TODO - how to ensure next is not called if observable is subscribed to, emits asynchronously and completes synchronously?
 * `| - single emit` observable completes immediately (expected)
 * `* -  single emit` observable emits and completes immediately (expected)
 * `...x...* - two emits` observable emits after a while and completes immediately (should only emit once)
 * `...x...| - two emits` observable emits after a while and completes later (emits twice as expected)
 * 
 * @param projectNext 
 * @param projectComplete 
 * @param defaultSynchronousNext 
 */
export const mapComplete = <T>(
  projectComplete: (data: T) => T,
  defaultComplete?: T,
) => (stream$: Observable<T>): Observable<T> => {
  return new Observable<T>((observer) => {
    let complete = false
    let sync = true
    let data: T | undefined

    const subscription = stream$.subscribe(
      (emit) => {
        data = emit

        if (!sync) {
          observer.next(data)
        }
      },
      (error) => observer.error(error),
      () => {
        complete = true

        if (!sync) {
          if (data !== undefined) {
            observer.next(projectComplete(data))
          } else {
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
      observer.next(data)
    }

    return subscription
  })
}
