/// <reference types="parsimmon" />
import P = require("parsimmon");
export interface ListTree {
    type: "ul" | "ol" | "shadow";
    children: Array<ListTree>;
    value: string | null;
    parent: ListTree | null;
}
export declare type Mapper<T> = (tagName: string, attributes?: any) => (children: string | T | null) => T;
export interface ResultType<T> {
    mapper: Mapper<T>;
    join: Function;
}
export declare class Parser<T> {
    opts: {
        type: ResultType<T>;
    };
    liLevelBefore: number | null;
    liLevel: number | null;
    rootTree: ListTree;
    currentTree: ListTree;
    acceptables: P.Parser<T>;
    constructor(opts: {
        type: ResultType<T>;
    });
    create(): void;
    parse(s: string): T | undefined;
}
export declare const asHTML: ResultType<string>;
export declare const asAST: ResultType<any>;
export declare const parse: (s: string) => any;
