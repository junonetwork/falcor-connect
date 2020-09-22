import { SFC, useCallback, useState } from 'react'
import { createElement as el } from 'react'
import { useStream } from '../src'
import { mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'


export const Debug: SFC = () => {
  const [number, setNumber] = useState(0)
  const onClick = useCallback(() => setNumber((n) => n + 1), [])

  const plusOne = useStream((stream$) => stream$.pipe(
    mergeMap((number) => of(number + 1))
  ), number)

  const plusTwo = useStream((stream$) => stream$.pipe(
    mergeMap((number) => number === undefined ? of(number) : of(number + 1))
  ), plusOne)

  console.log(number, plusOne, plusTwo)

  return el('div', {},
    el('button', { onClick }, 'Click'),
    el('div', {}, JSON.stringify({ number, plusOne, plusTwo }))
  )
}
