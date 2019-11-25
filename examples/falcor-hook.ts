import { createElement as el, SFC, useState, useCallback } from 'react'
import { pathOr } from 'ramda'
import { model, graphChange$ } from './model'
import { FalcorList, TerminalSentinel, map, UseFalcor, ErrorSentinel, Atom } from '../src'


type Todo = { label: TerminalSentinel<string>, status: TerminalSentinel<'pending' | 'complete'> }


const useFalcor = UseFalcor(model, graphChange$)

const PAGE_SIZE = 5
const isFirstPage = (page: number) => page === 0
const isLastPage = (page: number, length: number) => (page + 1) * PAGE_SIZE >= length


export const TodoList: SFC = () => {
  const [page, setPage] = useState(0)
  const { status, graphFragment } = useFalcor([
    ['todos', { from: page * PAGE_SIZE, to: (page * PAGE_SIZE) + PAGE_SIZE - 1 }, ['label', 'status']],
    ['todos', 'length']
  ])
  const lengthSentinel = pathOr<Atom<number> | ErrorSentinel>({ $type: 'error', value: 'Error' }, ['todos', 'length'], graphFragment)
  const length = lengthSentinel.$type === 'atom' ? lengthSentinel.value : 0
  const prevPage = useCallback(() => setPage(Math.max(page - 1, 0)), [page])
  const nextPage = useCallback(() => setPage(Math.min(page + 1, Math.floor(length / PAGE_SIZE))), [page, length])

  console.log(status, graphFragment, page)
  return el('div', {},
    el('ul', {},
      map(({ label, status }, idx) => (
        label.$type === 'error' || status.$type === 'error' ?
          el('li', { key: idx }, 'Error') :
          el('li', {
            key: idx,
            style: { textDecoration: status.value === 'complete' ? 'line-through' : 'none' },
          }, label.value)
      ),
      pathOr<FalcorList<Todo>>({} as FalcorList, ['todos'], graphFragment))),
    el('div', {},
      length === 0 ? null : el('p', {}, `${(page * PAGE_SIZE) + 1} to ${Math.min((page * PAGE_SIZE) + PAGE_SIZE, length)} of ${length}`),
      el('button', { onClick: prevPage, disabled: isFirstPage(page) }, 'previous'),
      el('button', { onClick: nextPage, disabled: isLastPage(page, length) }, 'next')))
}
