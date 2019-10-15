import { SFC, createElement as el, useState, useCallback } from 'react'
import { useStream } from '../src'
import { switchMap, scan, take, startWith, map, takeWhile, multicast, mergeScan, tap, delay } from 'rxjs/operators'
import { interval, of, iif, throwError, Subject, AsyncSubject, Observable } from 'rxjs'
import { range } from 'ramda'
import { useStreamNaive } from '../src/useStream'
// import { model, graphChange$ } from './model'
// import { WithFalcor } from '../src/WithFalcor'

// const withFalcor = WithFalcor(model, graphChange$)


export const Widget: SFC<{}> = () => {
  const [channel, setChannel] = useState('friend-list')
  const selectChannel = useCallback(({ target: { value } }) => setChannel(value), [])
  const next = useStream((stream$) => stream$.pipe(
    switchMap(() => interval(500).pipe(
      startWith(-1),
      scan<number, number[]>((data) => [...data, Math.floor(Math.random() * 10)], []),
      take(4),
    )),
  ), channel)

  console.log(next)

  return el('div', null,
    el('div', null,
      el('select', { value: channel, onChange: selectChannel },
       el('option', { value: 'friend-list' }, 'Friends'),
       el('option', { value: 'enemy-list' }, 'Enemies'),
       el('option', { value: 'grocery-list' }, 'Groceries'))),
    el('h1', null, channel),
    el('ul', null, ...(next || []).map((item, idx) => (
      el('li', { key: idx }, item))))
  )
}
