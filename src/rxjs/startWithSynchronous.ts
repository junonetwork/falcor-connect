import { Observable } from 'rxjs'


export const startWithSynchronous = <T>(synchronousData: T) => (stream$: Observable<T>): Observable<T> => {
  return new Observable<T>((observer) => {
    let pendingNext = true
    let pendingComplete = true

    const subscription = stream$.subscribe(
      (data) => {
        pendingNext = false
        observer.next(data)
      },
      (error) => observer.error(error),
      () => {
        pendingComplete = false
        observer.complete()
      }
    )

    if (pendingNext && pendingComplete) {
      observer.next(synchronousData)
    }

    return subscription
  })
}
