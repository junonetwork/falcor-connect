import { Model } from 'falcor'
import { createEventHandler } from 'recompose'
import { Observable } from 'rxjs'
import { range } from 'ramda'


export const {
  stream: graphChange$,
  handler: graphChange,
} = createEventHandler<undefined, Observable<undefined>>()

export const model = new Model({
  cache: {
    todos: range(0, 5).reduce<{ [key: number]: { label: string, status: string } } & { length: number }>((graph, idx) => {
      graph[idx] = {
        label: `TODO #${idx}`,
        status: 'pending',
      }
      return graph
    }, { length: 5 })
  },
  onChange: graphChange as () => void,
})
  .batch()
  .boxValues()
  .treatErrorsAsValues()
