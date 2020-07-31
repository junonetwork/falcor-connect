/// <reference types="falcor-json-graph" />
import { PathSet } from 'falcor';
import { O } from 'ts-toolbelt';
import { ErrorSentinel, Atom, FalcorList } from './types';
export declare const isPathSets: (paths: unknown) => paths is PathSet[];
export declare const isErrorSentinel: (fragment: unknown) => fragment is ErrorSentinel;
export declare const isEmpty: (fragment: unknown) => boolean;
export declare const isAtom: <T = unknown>(atom: unknown, value?: T | undefined) => atom is Atom<T>;
export declare const map: <T, R>(project: (item: T, index: number) => R, falcorList: ErrorSentinel | FalcorList<T>) => R[];
export declare const path: <T extends Record<string, unknown>, P extends (string | number)[]>(value: T | undefined, ...path: P) => ErrorSentinel | O.Path<T, P, 0> | undefined;
//# sourceMappingURL=utils.d.ts.map