import { useRef, useLayoutEffect, useCallback } from 'react'
import { Observable, ReplaySubject, PartialObserver } from 'rxjs'


export const useStreamCallback = <T, R = unknown>(
  project: (stream$: Observable<T>) => Observable<R>,
  observer?: PartialObserver<R>,
): (data: T) => void => {
  const stream$ = useRef(new ReplaySubject<T>())

  useLayoutEffect(() => {
    const subscription = stream$.current.pipe(project).subscribe(observer)
    return () => subscription.unsubscribe()
  }, [])

  return useCallback<(data: T) => void>((data) => {
    stream$.current.next(data)
  }, [])
}
