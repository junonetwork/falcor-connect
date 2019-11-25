import { createElement as el, useCallback } from 'react';
import { compose, withState } from 'recompose'
import { pathOr } from 'ramda'
import { model, graphChange$ } from './model'
import { ChildProps, FalcorList, TerminalSentinel, map, WithFalcor, Atom, ErrorSentinel } from '../src'


type Todo = { label: TerminalSentinel<string>, status: TerminalSentinel<'pending' | 'complete'> }

type Fragment = {
  todos: FalcorList<Todo>
}


const withFalcor = WithFalcor<{ page: number }, Fragment>(model, graphChange$)

const PAGE_SIZE = 5
const isFirstPage = (page: number) => page === 0
const isLastPage = (page: number, length: number) => (page + 1) * PAGE_SIZE >= length


export const TodoList = compose<{ page: number, setPage: (page: number) => void } & ChildProps<Fragment>, {}>(
  withState('page', 'setPage', 0),
  withFalcor(({ page }) => [
    ['todos', { from: page * PAGE_SIZE, to: (page * PAGE_SIZE) + PAGE_SIZE - 1 }, ['label', 'status']],
    ['todos', 'length']
  ])
)(({ page, setPage, status, graphFragment }) => {
  const lengthSentinel = pathOr<Atom<number> | ErrorSentinel>({ $type: 'error', value: 'Error' }, ['todos', 'length'], graphFragment)
  const length = lengthSentinel.$type === 'atom' ? lengthSentinel.value : 0
  const prevPage = useCallback(() => setPage(Math.max(page - 1, 0)), [page])
  const nextPage = useCallback(() => setPage(Math.min(page + 1, Math.floor(length / PAGE_SIZE))), [page, length])

  console.log(status, graphFragment)

  return el('div', {},
    el('ul', {},
      map(({ label, status }, idx) => (
        label.$type === 'atom' && status.$type === 'atom' ?
          el('li', {
            className: status.value,
            key: idx,
          }, label.value) :
          el('li', { key: idx }, 'Error')
      ),
      pathOr<FalcorList<Todo>>({} as FalcorList, ['todos'], graphFragment))),
    el('div', {},
      length === 0 ? null : el('p', {}, `${(page * PAGE_SIZE) + 1} to ${Math.min((page * PAGE_SIZE) + PAGE_SIZE, length)} of ${length}`),
      el('button', { onClick: prevPage, disabled: isFirstPage(page) }, 'previous'),
      el('button', { onClick: nextPage, disabled: isLastPage(page, length) }, 'next')))
})
