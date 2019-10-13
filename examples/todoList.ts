import { createElement } from 'react';
import { compose, withProps } from 'recompose'
import { ChildProps, FalcorList, TerminalSentinel, map } from '../src'
import { pathOr } from 'ramda';
import { withFalcor } from './model';


type Todo = { label: TerminalSentinel<string>, status: TerminalSentinel<'pending' | 'complete'> }

type Fragment = {
  todos: FalcorList<Todo>
}

export const TodoList = compose<{ page: number } & ChildProps<Fragment>, {}>(
  withProps({ page: 0 }),
  withFalcor<{ page: number }, Fragment>(({ page }) => [
    ['todos', { from: page, to: page + 10 }, ['label', 'status']],
    ['todos', 'length']
  ])
)(({ page, graphFragment }) => {
  const length = pathOr<TerminalSentinel<number>>({ $type: 'error', value: 'Error' }, ['json', 'todos', 'length'], graphFragment)

  return createElement('div', {},
    createElement('ul', {},
      map(({ label, status }, idx) => (
        label.$type === 'atom' && status.$type === 'atom' ?
          createElement('li', {
            className: status.value,
            key: idx,
          }, label.value) :
          createElement('li', { key: idx }, 'Error')
      ),
      pathOr<FalcorList<Todo>>({} as FalcorList, ['json', 'todos'], graphFragment))),
    length.$type === 'atom' ? createElement('p', {}, `${page * 10} to ${Math.min(page * 10 + 10, length.value as number)} of ${length.value}`) : null
  )
})
