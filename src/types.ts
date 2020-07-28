import { Path } from 'falcor'


export type Fragment = Record<string, unknown>

export type NextProps<T extends Fragment = Fragment> = { status: 'next', fragment: Partial<T>, error?: undefined }
export type CompleteProps<T extends Fragment = Fragment> = { status: 'complete', fragment: Partial<T>, error?: undefined }
export type ErrorProps = { status: 'error', fragment?: undefined, error: Error }

export type ChildProps<T extends Fragment = Fragment> = NextProps<T> | CompleteProps<T> | ErrorProps

export type Atom<T = unknown> = { $type: 'atom', value: T }
export type Ref = { $type: 'ref', value: Path }
export type ErrorSentinel<T = unknown> = { $type: 'error', value: T }
export type Sentinel = Atom | Ref | ErrorSentinel

export type Primitive = string | number | boolean | null | undefined
export type ComplexType = Primitive
  | ComplexType[]
  | { [key: string]: ComplexType }


export type FalcorList<Item = unknown> = { length?: Atom<number> | ErrorSentinel } & { [index: string]: Item }

export type TerminalSentinel<T> = Atom<T> | Atom<null> | Atom<undefined> | ErrorSentinel<string | { message: string }>
