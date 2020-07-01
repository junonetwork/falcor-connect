import { PathSet } from 'falcor'
import { equals, propEq } from 'ramda'
import { ErrorSentinel, Atom, FalcorList, Sentinel } from './types'


export const isPathSets = (paths: unknown): paths is PathSet[] => {
  if (!Array.isArray(paths)) {
    return false
  }

  if (paths.length === 0) {
    return false
  }

  for (let i = 0; i < paths.length; i += 1) {
    if (!Array.isArray(paths[i])) {
      return false
    }
  }

  return true
}


export const isErrorSentinel = (fragment: unknown): fragment is ErrorSentinel => {
  return propEq('$type', 'error', fragment as Record<string, unknown>)
}

export const isEmpty = (fragment: unknown) => {
  return fragment === undefined || (fragment as Atom<unknown>).value === null
}

export const isAtom = <T = unknown>(atom: unknown, value?: T): atom is Atom<T> => {
  if (atom === undefined || (atom as Sentinel).$type !== 'atom') {
    return false
  } else if (value === undefined) {
    return true
  }

  return equals(value, (atom as Atom<unknown>).value)
}

export const map = <T, R>(project: (item: T, index: number) => R, falcorList: FalcorList<T> | ErrorSentinel): R[] => {
  const result: R[] = []

  if (isErrorSentinel(falcorList)) {
    return result
  }

  for (const key in falcorList) {
    if (key !== 'length' && key !== '$__path' && !isErrorSentinel(falcorList[key]) && !isEmpty(falcorList[key])) {
      result.push(project(falcorList[key], parseInt(key, 10)))
    }
  }

  return result
}
