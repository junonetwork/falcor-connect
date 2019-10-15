import { useRef, useState, useLayoutEffect } from 'react'
import { Observable, Subject } from 'rxjs'


export const useStreamNaive = <T, R>(
  project: (stream$: Observable<T>) => Observable<R>,
  data: T,
): R | undefined => {
  let prev = useRef<T>()
  const stream$ = useRef(new Subject<T>())
  let [emit, setEmit] = useState<R>()

  useLayoutEffect(() => {
    const subscription = stream$.current.pipe(project).subscribe({
      next: (next) => setEmit(next)
    })

    stream$.current.next(data)
    return () => subscription.unsubscribe()
  }, [])

  if (prev.current !== data) {
    emit = undefined
    stream$.current.next(data)
  }

  prev.current = data

  return emit
}


export const useStream = <T, R>(
  project: (stream$: Observable<T>) => Observable<R>,
  data: T,
): R | undefined => {
  const prev = useRef<T>()
  const stream$ = useRef(new Subject<T>())
  const emit = useRef<R>()
  const synchronous = useRef(true)
  const [_, rerender] = useState(false)

  useLayoutEffect(() => {
    const subscription = stream$.current.pipe(project).subscribe({
      next: (next) => {
        emit.current = next
        if (!synchronous.current) {
          rerender((prev) => !prev)
        }
      }
    })

    stream$.current.next(data)
    return () => subscription.unsubscribe()
  }, [])

  synchronous.current = true
  if (prev.current !== data) {
    emit.current = undefined
    stream$.current.next(data)
  }
  prev.current = data
  synchronous.current = false

  return emit.current
}
