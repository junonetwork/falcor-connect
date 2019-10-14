import { useRef, useState, useLayoutEffect } from 'react'
import { Observable, Subject, from, Subscribable } from 'rxjs'
import { PathSet, Model, JSONEnvelope } from 'falcor'
import { switchMap, repeatWhen, distinctUntilChanged } from 'rxjs/operators'
import { TypedFragment } from './index'


export const useStream = <T, R>(
  project: (stream$: Observable<T>) => Observable<R>,
  data: T,
): { next?: R, error?: any, complete: boolean } => {
  const stream$ = useRef(new Subject<T>())
  const emit = useRef<{ next?: R, error?: any, complete: boolean }>({ complete: false })
  let synchronous = useRef(true)
  let [_, rerender] = useState()

  useLayoutEffect(() => {
    const subscription = stream$.current.pipe(project).subscribe({
      next: (next) => {
        emit.current.next = next
        if (!synchronous.current) rerender(emit.current)
      },
      error: (error) => {
        emit.current.error = error
        if (!synchronous.current) rerender(emit.current)
      },
      complete: () => {
        emit.current.complete = true
        if (!synchronous.current) rerender(emit.current) // if next and complete emit synchronously, this will cause rerender to be called twice
      }
    })

    stream$.current.next(data)
    return () => subscription.unsubscribe()
  }, [])

  synchronous.current = true
  stream$.current.next(data)
  synchronous.current = false

  return emit.current
}


export const UseFalcor = <Fragment extends Partial<TypedFragment> = Partial<TypedFragment>>(
  model: Model,
  graphChange$: Observable<undefined>
) => (
  path: PathSet[],
) => {
  return useStream(
    path$ => path$.pipe(
      distinctUntilChanged(),
      switchMap((paths) => from(model.get(...paths).progressively() as any as Subscribable<JSONEnvelope<Fragment>>)),
      repeatWhen(() => graphChange$)
    ),
    path
  )
}
