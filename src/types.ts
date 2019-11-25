import { JSONEnvelope, Path } from 'falcor'


export type NextProps<Fragment extends Partial<TypedFragment> = Partial<TypedFragment>> = { status: 'next', graphFragment: Fragment | {}, error?: undefined }
export type CompleteProps<Fragment extends Partial<TypedFragment> = Partial<TypedFragment>> = { status: 'complete', graphFragment: Fragment | {}, error?: undefined }
export type ErrorProps = { status: 'error', graphFragment: {}, error: Error }
export type ChildProps<Fragment extends Partial<TypedFragment> = Partial<TypedFragment>> = NextProps<Fragment> | CompleteProps<Fragment> | ErrorProps

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
