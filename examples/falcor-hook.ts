import { createElement as el, SFC, useState, useCallback, useRef } from 'react'
import { pathOr } from 'ramda'
import { model, graphChange$ } from './model'
import { FalcorList, TerminalSentinel, map, UseFalcor, ErrorSentinel, Atom, UseFalcorSet, UseFalcorCall, TypedFragment } from '../src'


type Props = { panel: 'left' | 'right' }

type Todo = { label: TerminalSentinel<string>, status: TerminalSentinel<'pending' | 'complete'> }


const useFalcor = UseFalcor(model, graphChange$)
const useFalcorSet = UseFalcorSet(model)
const useFalcorCall = UseFalcorCall(model)

const PAGE_SIZE = 5
const isFirstPage = (page: number) => page === 0
const isLastPage = (page: number, length: number) => (page + 1) * PAGE_SIZE >= length


export const TodoList: SFC<Props> = (props) => {
  const [state, render] = useState(false)
  const [page, setPage] = useState(0)

  const { status, graphFragment } = useFalcor([
    ['todos', { from: page * PAGE_SIZE, to: (page * PAGE_SIZE) + PAGE_SIZE - 1 }, ['label', 'status']],
    ['todos', 'length']
  ])

  const lengthSentinel = pathOr<Atom<number> | ErrorSentinel>({ $type: 'error', value: 'Error' }, ['todos', 'length'], graphFragment)
  const length = lengthSentinel.$type === 'atom' ? lengthSentinel.value : 0
  
  const prevPage = useCallback(() => setPage((page) => Math.max(page - 1, 0)), [])
  const nextPage = useCallback(() => setPage((page) => Math.min(page + 1, Math.floor(length / PAGE_SIZE))), [length])
  const rerender = useCallback(() => render((x) => !x), [])
  const { handler: toggleStatus, status: toggleStatusStatus } = useFalcorSet<{ idx: number, status: 'pending' | 'complete' }>(
    ({ idx, status }) => [{
      path: ['todos', idx, 'status'],
      value: status === 'pending' ? 'complete' : 'pending'
    }]
  )
  const { handler: createTodo } = useFalcorCall(() => ['todos', 'create'])

  const prev = useRef<{} | Partial<TypedFragment>>()
  console.log(props.panel, status, graphFragment, prev.current === graphFragment)
  prev.current = graphFragment

  return el('div', {},
    el('div', {},
      el('button', { onClick: prevPage, disabled: isFirstPage(page) }, 'previous'),
      el('button', { onClick: nextPage, disabled: isLastPage(page, length) }, 'next'),
      el('br'),
      el('button', { onClick: createTodo }, 'create todo'),
      el('br'),
      el('button', { onClick: rerender }, state ? 'rerender this' : 'rerender that'),
      el('br'),
      el('p', {}, 
        length === 0 ? null : el('span', {}, `${(page * PAGE_SIZE) + 1} to ${Math.min((page * PAGE_SIZE) + PAGE_SIZE, length)} of ${length}`),
        status === 'next' || toggleStatusStatus === 'next' ? el('span', {}, '...loading') : null)),
    el('ul', {},
      map(({ label, status }, idx) => (
        label === undefined || status === undefined || status.value === null || status.value === undefined ?
          null :
        label.$type === 'error' || status.$type === 'error' ?
          el('li', { key: idx }, 'Error') :
          el('li', {
            key: idx,
            style: { textDecoration: status.value === 'complete' ? 'line-through' : 'none' },
          },
            el('span', {}, label.value),
            el('button', { onClick: () => toggleStatus({ idx, status: status.value }) }, 'X'))
      ),
      pathOr<FalcorList<Todo>>({} as FalcorList, ['todos'], graphFragment))))
}
