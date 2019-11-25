import { Model, PathValue } from 'falcor'
import Router, { GetRoute } from 'falcor-router'
import { createEventHandler } from 'recompose'
import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'


export const {
  stream: graphChange$,
  handler: graphChange,
} = createEventHandler<undefined, Observable<undefined>>()

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
  }
}, {
  route: 'todos.length',
  get: () => {
    return of({
      path: ['todos', 'length'],
      value: 17,
    }) as unknown as ReturnType<GetRoute['get']>  
  }
}])

export const model = new Model({
  source: new FalcorRouter(),
  // cache: {
  //   todos: range(0, 22).reduce<{ [key: number]: { label: string, status: string } } & { length: number }>((graph, idx) => {
  //     graph[idx] = {
  //       label: `TODO #${idx + 1}`,
  //       status: 'pending',
  //     }
  //     return graph
  //   }, { length: 22 })
  // },
  onChange: graphChange as () => void,
})
  .batch()
  .boxValues()
  .treatErrorsAsValues()
