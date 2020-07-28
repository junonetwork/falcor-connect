import { PathSet } from 'falcor'
import { equals } from 'ramda'
import { O } from 'ts-toolbelt'
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
  return fragment !== undefined && fragment !== null && (fragment as Sentinel).$type === 'error'
}

export const isEmpty = (fragment: unknown) => {
  return fragment === undefined || (fragment as Atom<unknown>).value === null
}

export const isAtom = <T = unknown>(atom: unknown, value?: T): atom is Atom<T> => {
  if ((atom as Sentinel)?.$type !== 'atom') {
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

export const path = <T extends Record<string, unknown>, P extends (string | number)[]>(value: T | undefined, ...path: P): O.Path<T, P, 0> | ErrorSentinel | undefined => {
  if (value === undefined) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = value

  for (let i = 0; i < path.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const next = result[path[i]]
    if (next === undefined || next === null) {
      return undefined
    } else if (isErrorSentinel(next)) {
      return next
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    result = next
  }

  return result as O.Path<T, P, 0>
}
