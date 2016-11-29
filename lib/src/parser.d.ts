/// <reference types="parsimmon" />
import P = require("parsimmon");
export interface ListTree {
    type: "ul" | "ol" | "shadow";
    children: Array<ListTree>;
    value: string | null;
    parent: ListTree | null;
}
export declare class Parser {
    liLevelBefore: number | null;
    liLevel: number | null;
    rootTree: ListTree;
    currentTree: ListTree;
    acceptables: P.Parser<string>;
    constructor(opts?: {
        silent: boolean;
        mapper: (tagName: string) => (children: any) => string;
    });
    parse(s: string): string | undefined;
}
export declare const parse: (s: string) => string | undefined;
