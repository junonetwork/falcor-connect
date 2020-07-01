import { useRef, useState, useLayoutEffect } from 'react'
import { Observable, Subject } from 'rxjs'


/**
 * tests:
 * - calling useStream on synchronous stream should return: data
 *   - it should not return: undefined|data
 *   - tests `synchronous.current = true; ... ; synchronous.current = false`
 * - calling useStream twice on a delayed stream should return: undefined...data1...undefined...data2
 *   - it should not return: undefined...data1...data1...data2
 *   - tests `result.current = undefined`
 * - calling useStream on a delayed stream should return: undefined...data1
 *   - it should not return: undefined...data1...data1...data1...data1...
 *   - tests infinite loop prevention where stream next emit triggers another event to be dispatched
 *   - not sure if this is fixed.  see below implementation
 * - calling useStream on a synchronous stream should return: data1...data2...data3
 *
 * maybe test as a matrix against
 * - stream types
 *   - stream that emits once synchronous  :data
 *   - stream that emits multiple times synchronously :data|data2|data3
 *   - stream that emits synchronously and continues asynchronously :data...data2...data3
 *   - stream that emits once asynchronously :...data1
 *   - stream that emits asyncronously multiple times :...data1...data2...data3
 * - call count/signature
 *   - call once
 *   - call multiple times w/ different arg
 *   - call multiple times w/ the same arg
 */
export const useStream = <T, R>(
  project: (stream$: Observable<T>) => Observable<R>,
  data: T,
): R | undefined => {
  const result = useRef<R>()
  const synchronous = useRef(true)
  const rerendering = useRef(false)
  const stream$ = useRef(new Subject<T>())
  const [_, rerender] = useState(false)

  useLayoutEffect(() => {
    const subscription = stream$.current.pipe(project).subscribe({
      next: (next) => {
        result.current = next
        if (!synchronous.current) {
          rerendering.current = true
          rerender((x) => !x)
        }
      }
    })

    stream$.current.next(data)
    return () => subscription.unsubscribe()
  }, [])

  if (!rerendering.current) {
    synchronous.current = true
    result.current = undefined
    stream$.current.next(data)
    synchronous.current = false
  }
  rerendering.current = false

  return result.current
}
