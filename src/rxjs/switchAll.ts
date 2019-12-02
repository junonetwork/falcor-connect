import { Observable, Unsubscribable } from 'rxjs'


export const switchAll = <T>() => (props$: Observable<Observable<T>>) => {
  return new Observable<T>((observer) => {
    let prevInnerSubscription: Unsubscribable | undefined

    const subscription = props$.subscribe({
      next: (data$) => {
        const innerSubscription = data$.subscribe(observer)
        if (prevInnerSubscription !== undefined) {
          prevInnerSubscription.unsubscribe()
        }
        prevInnerSubscription = innerSubscription
      },
      error: (error) => {
        console.error(error)
        observer.error(error)
      },
      complete: () => {
        console.log('COMPLETE')
        observer.complete()
      },
    })

    return () => {
      console.log('UNSUBSCRIBE')
      if (prevInnerSubscription !== undefined) prevInnerSubscription.unsubscribe()
      subscription.unsubscribe()
    }
  })
}
