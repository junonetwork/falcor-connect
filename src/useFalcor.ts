import { Observable } from 'rxjs'
import { PathSet, Model } from 'falcor'
import { TypedFragment, ChildProps } from './types'
import { useStream } from './useStream'
import { connect, Options } from './connect'


export const UseFalcor = <Fragment extends Partial<TypedFragment> = Partial<TypedFragment>>(
  model: Model,
  graphChange$: Observable<undefined>,
  options: Options = {}
) => {
  const connectedModel = connect<Fragment>(model, graphChange$, options)

  return (pathSets: PathSet[]): ChildProps => useStream(connectedModel, pathSets) || { status: 'next', graphFragment: {} }
}
