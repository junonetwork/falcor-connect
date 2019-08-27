import { createElement } from 'react';
import { Model } from 'falcor'
import HTTPDataSource from 'falcor-http-datasource'
import { createEventHandler, mapPropsStream, compose, withProps } from 'recompose'
import { Observable } from 'rxjs'
import { connect, ChildProps, FalcorList } from '../src'

const {
  stream: graphChange$,
  handler: graphChange,
} = createEventHandler<undefined, Observable<undefined>>()

const model = new Model({
  source: new HTTPDataSource('/api/model.json'),
  onChange: graphChange as () => void,
})
  .batch()
  .boxValues()
  .treatErrorsAsValues()

const withFalcor = connect(model, graphChange$)



type Fragment = {
  todos: FalcorList<{ label: string, status: 'pending' | 'complete' }>
}

const Container = compose(
  withProps({ page: 0 }),
  mapPropsStream(withFalcor<{ page: number }, Fragment>(({ page }) => [
    ['todos', { to: page + 10 }, ['label', 'status']],
    ['todos', 'length']
  ])),
  ({ page, graphFragment: { todos }}: ChildProps<{ page: number }, Fragment>) => {
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
