import { SFC, createElement as el, useState, useCallback } from 'react'
import { useStream } from '../src'
import { switchMap, startWith, map, tap, delay, catchError } from 'rxjs/operators'
import { of, iif, throwError, Observable } from 'rxjs'
import { range } from 'ramda'


const switchScan = <T, R>(accumulator: (acc: R, value: T, index: number) => Observable<R>, seed: R) => (
  source$: Observable<T>
) => {
  let acc = seed
  return source$.pipe(
    switchMap((value, index) => accumulator(acc, value, index)),
    tap((value) => acc = value)
  )
}

const project = (stream$: Observable<string>) => stream$.pipe(
  switchScan<string, [{ [channel: string]: { data: number[], status: string } }, string | undefined]>(([cache], channel) => {
    if (cache[channel] === undefined) {
      return of(range(0, 5).map(() => Math.floor(Math.random() * 10))).pipe(
        delay(1000),
        switchMap((data) => iif(
          () => channel === 'grocery-list',
          throwError('500'),
          of(data),
        )),
        map<number[], [{ [channel: string]: { data: number[], status: string } }, string]>((data) => [
          { ...cache, [channel]: { data, status: 'complete' } },
          channel
        ]),
        startWith<[{ [channel: string]: { data: number[], status: string } }, string]>([
          { ...cache, [channel]: { data: [], status: 'pending' } },
          channel
        ]),
        catchError(() => of<[{ [channel: string]: { data: number[], status: string } }, string]>([
          { ...cache, [channel]: { data: [], status: 'error' } },
          channel
        ]))
      )
    }

    return of([cache, channel])
  }, [{}, undefined]),
  map(([cache, channel]) => cache[channel!])
)

export const CachedWidget: SFC = () => {
  const [channel, setChannel] = useState('friend-list')
  const selectChannel = useCallback(({ target: { value } }) => setChannel(value), [])
  const next = useStream(project, channel)

  console.log(next)
  const { data = [], status = 'pending' } = next ? next : {}

  return el('div', null,
    el('div', null,
      el('select', { value: channel, onChange: selectChannel },
        el('option', { value: 'friend-list' }, 'Friends'),
        el('option', { value: 'enemy-list' }, 'Enemies'),
        el('option', { value: 'grocery-list' }, 'Groceries'))),
    el('h1', null, channel),
    status === 'pending' && el('div', null, 'loading...'),
    status === 'error' && el('div', null, 'Error'),
    el('ul', null, ...data.map((item, idx) => (
      el('li', { key: idx }, item))))
  )
}
