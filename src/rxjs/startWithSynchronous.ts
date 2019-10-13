import { Observable } from 'rxjs'


export const startWithSynchronous = <T>(defaultData: T) => (stream$: Observable<T>): Observable<T> => {
  return new Observable<T>((observer) => {
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
      () => observer.complete(),
    )

    sync = false

    if (data !== undefined) {
      observer.next(defaultData)
    }

    return subscription
  })
}
