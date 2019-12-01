import { Observable } from 'rxjs'
import { PathSet, Model } from 'falcor'
import { TypedFragment, ChildProps } from '../types'
import { useStream } from './useStream'
import { connect, Options } from '../connect'


export const UseFalcor = (
  model: Model,
  graphChange$: Observable<undefined>,
  options: Options = {}
) => {
  const connectedModel = connect(model, graphChange$, options)

  return <Fragment = TypedFragment>(pathSets: PathSet[]): ChildProps<Fragment> => (
    useStream(connectedModel, pathSets) || { status: 'next', graphFragment: {} }
  )
}
