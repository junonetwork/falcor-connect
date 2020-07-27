import { Model, PathValue } from 'falcor'
import Router, { GetRoute, SetRoute, CallRoute } from 'falcor-router'
import { createEventHandler } from 'recompose'
import { of, never, Observable } from 'rxjs'
import { delay } from 'rxjs/operators'
import { Atom } from '../src/types'


export const {
  stream: graphChange$,
  handler: graphChange,
} = createEventHandler<void, Observable<void>>()

const FalcorRouter = Router.createClass([{
  route: 'todos[{integers}]["label", "status"]',
  get: ([_, indices]: [string, number[]]) => {
    return of(indices.reduce<PathValue[]>((pathValues, idx) => {
      if (idx < 17) {
        pathValues.push({
          path: ['todos', idx, 'label'],
          value: `TODO #${idx + 1}`,
        }, {
          path: ['todos', idx, 'status'],
          value: idx <= 1 ? 'complete' : 'pending',
        })
      } else {
        pathValues.push({
          path: ['todos', idx],
          value: null,
        })
      }

      return pathValues
    }, [])).pipe(delay(1000)) as unknown as ReturnType<GetRoute['get']>
  },
  set: (jsonGraph) => {
    return of(Object.entries<{ label: Atom<string>, status: Atom<'pending' | 'complete'> }>(jsonGraph.todos).reduce<PathValue[]>((pathValues, [idx, todo]) => {
      return Object.entries(todo).reduce<PathValue[]>((pathValues, [field, { value }]) => {
        pathValues.push({
          path: ['todos', idx, field],
          value
        })
        return pathValues
      }, pathValues)
    }, [])).pipe(delay(1000)) as unknown as ReturnType<SetRoute['set']>
  }
}, {
  route: 'todos.length',
  get: () => {
    return of({
      path: ['todos', 'length'],
      value: 17,
    }).pipe(delay(1000)) as unknown as ReturnType<GetRoute['get']>
  }
}, {
  route: 'todos.create',
  call: () => {
    return never() as unknown as ReturnType<CallRoute['call']>
  }
}])

export const model = new Model({
  source: new FalcorRouter(),
  onChange: graphChange as () => void,
  // onChange: () => { console.log('CHANGE'); graphChange(); }
  // maxSize: 1,
})
  .batch()
  .boxValues()
  .treatErrorsAsValues()


const _window: { [key: string]: any } = window
_window.graphChange = graphChange
_window.model = model
