import { Observable } from 'rxjs'
import { debounceTime } from 'rxjs/operators'


export const endWithSynchronous = <T>(projectComplete: (data?: T) => T) => (stream$: Observable<T>): Observable<T> => {
  return new Observable<T>((observer) => {
    return new Observable<T>((innerObserver) => {
      let _data: T | undefined
      let sync = true
      let complete = false

      const subscription = stream$.subscribe({
        next: (data) => {
          _data = data
          if (!sync) {
            innerObserver.next(data)
          }
        },
        error: (error) => innerObserver.error(error),
        complete: () => {
          complete = true
          if (!sync) {
            innerObserver.next(projectComplete(_data))
            innerObserver.complete()
          }
        }
      })

      sync = false

      if (complete) {
        observer.next(projectComplete(_data))
        innerObserver.complete()
      } else if (_data !== undefined) {
        observer.next(_data)
      }

      return subscription
    })
      .pipe(debounceTime(0))
      .subscribe(observer)
  })
}
