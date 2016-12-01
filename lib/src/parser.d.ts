/// <reference types="parsimmon" />
import P = require("parsimmon");
export interface ListTree {
    type: "ul" | "ol" | "shadow";
    children: Array<ListTree>;
    value: string | null;
    parent: ListTree | null;
}
export declare type Plugin = (args: string, content: any) => string;
export declare type Mapper<T> = (tagName: string, attributes?: any) => (children: string | T | null) => T;
export interface ExportType<T> {
    mapper: Mapper<T>;
    join: Function;
}
export declare class Parser<T> {
    opts: {
        export: ExportType<T>;
        plugins?: {
            [pluginName: string]: Plugin;
        };
    };
    liLevelBefore: number | null;
    liLevel: number | null;
    rootTree: ListTree;
    currentTree: ListTree;
    acceptables: P.Parser<T>;
    constructor(opts: {
        export: ExportType<T>;
        plugins?: {
            [pluginName: string]: Plugin;
        };
    });
    create(): void;
    parse(s: string): T | undefined;
}
export declare const asHTML: ExportType<string>;
export declare const asAST: ExportType<any>;
export declare const parse: (s: string) => any;
