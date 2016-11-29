/// <reference types="parsimmon" />
import P = require("parsimmon");
export interface ListTree {
    type: "ul" | "ol" | "shadow";
    children: Array<ListTree>;
    value: string | null;
    parent: ListTree | null;
}
export declare type Mapper<T> = (tagName: string, attributes?: any) => (children: string | T | null) => T;
export declare class Parser<T> {
    opts: {
        mapper: Mapper<T>;
        join: (obj: Array<T>) => T;
    };
    liLevelBefore: number | null;
    liLevel: number | null;
    rootTree: ListTree;
    currentTree: ListTree;
    acceptables: P.Parser<T>;
    constructor(opts: {
        mapper: Mapper<T>;
        join: (obj: Array<T>) => T;
    });
    create(): void;
    parse(s: string): T | undefined;
}
export declare const parse: (s: string) => any;
