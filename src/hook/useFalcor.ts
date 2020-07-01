import { Observable } from 'rxjs'
import { PathSet, Model } from 'falcor'
import { Fragment, ChildProps } from '../types'
import { useStream } from './useStream'
import { connect, Options } from '../connect'


export const UseFalcor = (
  model: Model,
  graphChange$: Observable<undefined>,
  options: Options = {}
) => {
  const connectedModel = connect(model, graphChange$, options)

  return <T extends Fragment = Fragment>(pathSets: PathSet[]): ChildProps<T> => {
    return useStream(connectedModel, pathSets) ?? { status: 'next', fragment: {} }
  }
}
