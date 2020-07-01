/// <reference types="falcor-json-graph" />
import { PathSet } from 'falcor';
import { ErrorSentinel, Atom, FalcorList } from './types';
export declare const isPathSets: (paths: unknown) => paths is PathSet[];
export declare const isErrorSentinel: (fragment: unknown) => fragment is ErrorSentinel<unknown>;
export declare const isEmpty: (fragment: unknown) => boolean;
export declare const isAtom: <T = unknown>(atom: unknown, value?: T | undefined) => atom is Atom<T>;
export declare const map: <T, R>(project: (item: T, index: number) => R, falcorList: ErrorSentinel<unknown> | FalcorList<T>) => R[];
//# sourceMappingURL=utils.d.ts.map