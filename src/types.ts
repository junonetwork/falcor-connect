import { Path } from 'falcor'


export type NextProps<Fragment = TypedFragment> = { status: 'next', graphFragment: Partial<Fragment> | {}, error?: undefined }
export type CompleteProps<Fragment = TypedFragment> = { status: 'complete', graphFragment: Partial<Fragment> | {}, error?: undefined }
export type ErrorProps = { status: 'error', graphFragment: {}, error: Error }
export type ChildProps<Fragment = TypedFragment> = NextProps<Fragment> | CompleteProps<Fragment> | ErrorProps

export type Atom<T = any> = { $type: 'atom', value: T }
export type Ref = { $type: 'ref', value: Path }
export type ErrorSentinel<T = any> = { $type: 'error', value: T }
export type Sentinel = Atom | Ref | ErrorSentinel

export type Primitive = string | number | boolean | null | undefined
export type ComplexType = Primitive
  | Primitive[]
  | { [key: string]: Primitive }
  | { [key: string]: Primitive[] }


export type FalcorList<Item = any> = { length: Atom<number> | ErrorSentinel } & { [index: string]: Item }

export type TerminalSentinel<T> = Atom<T> | Atom<null> | Atom<undefined> | ErrorSentinel<string | { message: string }>

export type TypedFragment = { [key: string]: TerminalSentinel<any> | TypedFragment }
