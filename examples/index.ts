import { createElement } from 'react';
import { Model } from 'falcor'
import { createEventHandler, compose, withProps } from 'recompose'
import { Observable } from 'rxjs'
import { ChildProps, FalcorList, WithFalcor, TerminalSentinel, map } from '../src'
import { pathOr } from 'ramda';


const {
  stream: graphChange$,
  handler: graphChange,
} = createEventHandler<undefined, Observable<undefined>>()

const model = new Model({
  cache: {},
  onChange: graphChange as () => void,
})
  .batch()
  .boxValues()
  .treatErrorsAsValues()


const withFalcor = WithFalcor(model, graphChange$)

type Todo = { label: TerminalSentinel<string>, status: TerminalSentinel<'pending' | 'complete'> }

type Fragment = {
  todos: FalcorList<Todo>
}

export const TodoList = compose(
  withProps({ page: 0 }),
  withFalcor<{ page: number }, Fragment>(({ page }) => [
    ['todos', { from: page, to: page + 10 }, ['label', 'status']],
    ['todos', 'length']
  ]),
  ({ page, graphFragment }: { page: number } & ChildProps<Fragment>) => {
    const length = pathOr<TerminalSentinel<number>>({ $type: 'error', value: 'Error' }, ['json', 'todos', 'length'], graphFragment)

    return createElement('div', {},
      createElement('ul', {},
        map(({ label, status }, idx) => (
          label.$type === 'atom' && status.$type === 'atom' ?
            createElement('li', {
              className: status.value,
              key: label.value,
            }, label.value) :
            createElement('li', { key: idx }, 'Error')
        ),
        pathOr<FalcorList<Todo>>({} as FalcorList, ['json', 'todos'], graphFragment))),
      length.$type === 'atom' ? createElement('p', {}, `Showing ${page * 10} to ${page * 10 + 10} of ${length.value}`) : null
    )
  }
)
