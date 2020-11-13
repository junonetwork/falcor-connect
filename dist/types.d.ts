/// <reference types="falcor-json-graph" />
import { Path } from 'falcor';
export declare type Fragment = Record<string, unknown>;
export declare type NextProps<T extends Fragment = Fragment> = {
    status: 'next';
    fragment: Partial<T>;
    error?: undefined;
};
export declare type CompleteProps<T extends Fragment = Fragment> = {
    status: 'complete';
    fragment: Partial<T>;
    error?: undefined;
};
export declare type ErrorProps = {
    status: 'error';
    fragment?: undefined;
    error: Error;
};
export declare type ChildProps<T extends Fragment = Fragment> = NextProps<T> | CompleteProps<T> | ErrorProps;
export declare type Atom<T = unknown> = {
    $type: 'atom';
    value: T;
};
export declare type Ref = {
    $type: 'ref';
    value: Path;
};
export declare type ErrorSentinel<T = unknown> = {
    $type: 'error';
    value: T;
};
export declare type Sentinel = Atom | Ref | ErrorSentinel;
export declare type Primitive = string | number | boolean | null | undefined;
export declare type ComplexType = Primitive | ComplexType[] | {
    [key: string]: ComplexType;
};
export declare type FalcorList<Item = unknown> = {
    length?: Atom<number> | ErrorSentinel;
} & {
    [index: string]: Item;
};
export declare type TerminalSentinel<T> = Atom<T> | Atom<null> | Atom<undefined> | ErrorSentinel;
//# sourceMappingURL=types.d.ts.map