import { Observable } from 'rxjs'


export const startWithSynchronous = <T>(projectNext: (data?: T) => T) => (stream$: Observable<T>): Observable<T> => {
  return new Observable<T>((observer) => {
    let _data: T | undefined
    let sync = true
    let complete = false

    const subscription = stream$.subscribe(
      (data) => {
        _data = data
        if (!sync) {
          observer.next(data)
        }
      },
      (error) => observer.error(error),
      () => {
        complete = true
        if (!sync) {
          observer.complete()
        }
      }
    )

    sync = false
    observer.next(projectNext(_data))

    if (complete) {
      observer.complete()
    }

    return subscription
  })
}
