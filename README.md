# Falcor Connect

React-Falcor bindings and a Higher Order Component

## Usage

See `/examples`.

```js
import { createElement } from 'react';
import { Model } from 'falcor'
import { createEventHandler, compose, withProps } from 'recompose'
import { Observable } from 'rxjs'
import { ChildProps, FalcorList, WithFalcor } from '../src'


const {
  stream: graphChange$,
  handler: graphChange,
} = createEventHandler<void, Observable<void>>()

const model = new Model({
  cache: {},
  onChange: graphChange as () => void,
})
  .batch()
  .boxValues()
  .treatErrorsAsValues()


const withFalcor = WithFalcor(model, graphChange$)

type Fragment = {
  todos: FalcorList<{ label: string, status: 'pending' | 'complete' }>
}

export const TodoList = compose(
  withProps({ page: 0 }),
  withFalcor<{ page: number }, Fragment>(({ page }) => [
    ['todos', { from: page, to: page + 10 }, ['label', 'status']],
    ['todos', 'length']
  ]),
  ({ page, graph: { todos }}: ChildProps<{ page: number }, Fragment>) => {
    return createElement('div', {},
      createElement('ul', {},
        Object.keys(todos)
          .filter((key) => key !== 'length')
          .map((key) => (
            createElement('li', {
              className: todos[key].status,
              key: todos[key].label
            }, todos[key].label)
          ))),
      createElement('p', {}, `Showing ${page * 10} to ${page * 10 + 10} of ${todos.length}`)
    )
  }
)
```
