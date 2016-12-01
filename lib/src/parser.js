"use strict";
var P = require("parsimmon");
var Parser = (function () {
    function Parser(opts) {
        this.opts = opts;
        this.liLevelBefore = null;
        this.liLevel = null;
        this.rootTree = {
            value: null,
            children: [],
            type: "shadow",
            parent: null
        };
        this.currentTree = {
            value: null,
            children: [],
            type: "shadow",
            parent: null
        };
        this.create();
    }
    Parser.prototype.create = function () {
        var _this = this;
        function flags(re) {
            var s = '' + re;
            return s.slice(s.lastIndexOf('/') + 1);
        }
        function ignore(re, group) {
            if (group === void 0) { group = 0; }
            var _a = P, makeSuccess = _a.makeSuccess, makeFailure = _a.makeFailure;
            var anchored = RegExp('^(?:' + re.source + ')', flags(re));
            var expected = '' + re;
            return P(function (input, i) {
                var match = anchored.exec(input.slice(i));
                if (match) {
                    var fullMatch = match[0];
                    var groupMatch = match[group];
                    if (groupMatch != null) {
                        return makeFailure(i + fullMatch.length, groupMatch);
                    }
                }
                return makeSuccess(i, expected);
            });
        }
        var whitespace = P.regexp(/\s+/m);
        var asterisk = P.string("*");
        var sharp = P.string("#");
        var plainStr = P.regexp(/[^`_\*\r\n]+/);
        var linebreak = P.string("\r\n").or(P.string("\n")).or(P.string("\r"));
        var equal = P.string("=");
        var minus = P.string("-");
        var join = this.opts.export.join;
        var mapper = this.opts.export.mapper;
        var token = function (p) {
            return p.skip(P.regexp(/\s*/m));
        };
        var h1Special = P.regexp(/^(.*)\n\=+/, 1)
            .skip(P.alt(P.eof, P.string("\n")))
            .map(mapper("h1"));
        var h2Special = P.regexp(/^(.*)\n\-+/, 1)
            .skip(P.alt(P.eof, P.string("\n")))
            .map(mapper("h2"));
        var h1 = token(P.seq(sharp, whitespace).then(plainStr)).map(mapper("h1"));
        var h2 = token(P.seq(sharp.times(2), whitespace).then(plainStr)).map(mapper("h2"));
        var h3 = token(P.seq(sharp.times(3), whitespace).then(plainStr)).map(mapper("h3"));
        var h4 = token(P.seq(sharp.times(4), whitespace).then(plainStr)).map(mapper("h4"));
        var h5 = token(P.seq(sharp.times(5), whitespace).then(plainStr)).map(mapper("h5"));
        var h6 = token(P.seq(sharp.times(6), whitespace).then(plainStr)).map(mapper("h6"));
        var strongStart = P.string("**").or(P.string("__"));
        var strongEnd = strongStart;
        var strong = strongStart
            .then(plainStr)
            .map(mapper("strong"))
            .skip(strongEnd);
        var emStart = P.string("*").or(P.string("_"));
        var emEnd = emStart;
        var em = emStart
            .then(plainStr)
            .map(mapper("em"))
            .skip(emEnd);
        var anchor = P.seqMap(P.string("["), P.regexp(/[^\]\r\n]+/), P.string("]("), P.regexp(/[^\)\r\n]+/), P.string(")"), function (_1, label, _2, href, _3) {
            return mapper("a", { href: href })(label);
        });
        var img = P.seqMap(P.string("!["), P.regexp(/[^\]\r\n]+/), P.string("]("), P.regexp(/[^\)\r\n]+/), P.string(")"), function (_1, alt, _2, src, _3) {
            return mapper("img", { src: src, alt: alt })(null);
        });
        var codeStart = P.string("`");
        var codeEnd = P.string("`");
        var code = codeStart
            .then(plainStr)
            .map(mapper("code"))
            .skip(codeEnd);
        var pluginInline = P.seqMap(P.string("@["), P.regexp(/[a-zA-Z]+/), P.regexp(/:{0,1}([^\]]*)/, 1), P.string("]"), function (_1, pluginName, args, _2) {
            return _this.opts.plugins && _this.opts.plugins[pluginName] ? _this.opts.plugins[pluginName](args, null) : join([_1, pluginName, args, _2]);
        });
        var inline = P.alt(pluginInline, anchor, img, em, strong, code, P.regexp(/[^\r\n=-\[\]\*\`\@]+/), P.regexp(/./));
        var tdStr = P.regexp(/[^\r\n\[\]\*|`]+(?= \|)/);
        var tableInline = tdStr;
        var tableStart = P.string("| ");
        var tableEnd = P.string(" |");
        var tableSep = P.string(" | ");
        var tableInner = P.seqMap(tableInline.skip(tableSep).atLeast(1), tableInline, function (a, b) { return a.concat([b]); });
        var tableInnerOnlyHeader = P.seqMap(P.regexp(/-+/).skip(tableSep).atLeast(1), P.regexp(/-+/), function (a, b) { return a.concat([b]); });
        var tableHeader = tableStart.then(tableInner).skip(tableEnd).skip(linebreak);
        var tableHSep = tableStart.then(tableInnerOnlyHeader).skip(tableEnd).skip(linebreak);
        var tableBody = tableStart.then(tableInner).skip(tableEnd.then(linebreak.atMost(1)));
        var table = P.seqMap(tableHeader, tableHSep, tableBody.atLeast(1), function (headers, _1, bodies) { return mapper("table")(join([
            mapper("tr")(join(headers.map(function (h) { return mapper("th")(h); }))),
            join(bodies.map(function (b) { return mapper("tr")(join(b.map(function (x) { return mapper("td")(x); }))); }))
        ])); });
        var inlines = inline.atLeast(1).map(join);
        var paragraphBegin = inlines;
        var paragraphEnd = ignore(/```\n.*\n```/);
        var paragraphLine = P.lazy(function () { return P.alt(P.seq(paragraphBegin, linebreak.skip(paragraphEnd).result(mapper("br")(null)), paragraphLine).map(join), inlines); });
        var paragraph = paragraphLine
            .map(mapper("p"));
        var listIndent = P.string("  ");
        var liSingleLine = plainStr;
        var ulStart = P.string("- ").or(P.string("* "));
        var olStart = P.regexp(/[0-9]+\. /);
        var liLevel = null;
        var liLevelBefore = null;
        var nodeType;
        var listLineContent = P.seqMap(P.seqMap(listIndent.many(), P.index, function (_1, index) {
            var _index = index;
            if (liLevelBefore === null)
                liLevelBefore = liLevel = _index.column;
            liLevelBefore = liLevel;
            liLevel = _index.column;
        }), ulStart.or(olStart), function (_1, start) {
            // detect which types of content
            nodeType = ((start == "* ") || (start == "- ")) ? "ul" : "ol";
        }).then(liSingleLine).skip(linebreak.atMost(1)).map(function (x) {
            if (liLevelBefore == liLevel) {
                _this.currentTree.children.push({
                    value: x,
                    children: [],
                    type: nodeType,
                    parent: _this.currentTree
                });
            }
            else if (liLevelBefore < liLevel) {
                var currentTreeIndex = _this.currentTree.children.length - 1;
                _this.currentTree = _this.currentTree.children[currentTreeIndex];
                _this.currentTree.children.push({
                    children: [],
                    type: nodeType,
                    parent: _this.currentTree,
                    value: x
                });
            }
            else if (liLevelBefore > liLevel) {
                var unindetationStep = (liLevelBefore - liLevel - 1) / "  ".length;
                for (var i = 0; i < unindetationStep; i++) {
                    if (_this.currentTree.parent !== null) {
                        _this.currentTree = _this.currentTree.parent;
                    }
                }
                _this.currentTree.children.push({
                    type: nodeType,
                    children: [],
                    parent: _this.currentTree,
                    value: x
                });
            }
            var _nodeType = nodeType;
            return _nodeType;
        });
        var lists = listLineContent.atLeast(1).skip(linebreak.atMost(1)).map(function (nodeTypes) {
            _this.rootTree.type = nodeTypes[0];
            var result = treeToHtml(_this.rootTree);
            _this.rootTree = _this.currentTree = {
                value: null,
                children: [],
                type: "shadow",
                parent: null
            };
            return result;
        });
        var treeToHtml = function (treeOrNode) {
            if (treeOrNode.type === "shadow") {
                return join(treeOrNode.children.map(treeToHtml));
            }
            else if (treeOrNode.children.length === 0 && treeOrNode.value !== null) {
                return mapper("li")(treeOrNode.value);
            }
            else if (treeOrNode.children.length !== 0 && treeOrNode.value !== null) {
                var children = treeOrNode.children;
                return mapper("li")(join([treeOrNode.value, mapper(treeOrNode.children[0].type)(join(children.map(treeToHtml)))]));
            }
            else {
                var children = treeOrNode.children;
                return mapper(treeOrNode.type)(join(children.map(treeToHtml)));
            }
        };
        var codeBlockBegin = P.regexp(/^```/);
        var codeBlockEnd = P.regexp(/^```/);
        var codeBlockDefinitionStr = P.regexp(/[^`\r\n]*/);
        var codeBlockStr = P.regexp(/[^`\r\n]+/);
        var codeBlock = P.seqMap(codeBlockBegin, codeBlockDefinitionStr, linebreak, linebreak.or(codeBlockStr.skip(linebreak)).many(), codeBlockEnd, function (_1, definition, _2, code, _3) {
            return mapper("pre")(mapper("code")(join(code)));
        });
        var blockquoteStr = P.regexp(/[^\r\n]+/);
        var blockquoteBegin = P.string("> ");
        var blockquoteLevel = null;
        var createBlockquote = false;
        var blockquoteLine = P.lazy(function () {
            return P.seqMap(P.seqMap(blockquoteBegin.atLeast(1), P.index, function (_1, index) {
                var _index = index;
                if (blockquoteLevel === null) {
                    blockquoteLevel = _index.column;
                    return;
                }
                if (blockquoteLevel < _index.column) {
                    createBlockquote = true;
                }
                else {
                    createBlockquote = false;
                }
                blockquoteLevel = _index.column;
            }), blockquoteStr, linebreak.atMost(1), function (_1, s, _2) {
                if (createBlockquote)
                    return mapper("blockquote")(s);
                return s;
            });
        });
        var blockquote = P.lazy(function () {
            blockquoteLevel = null;
            createBlockquote = false;
            return blockquoteLine.atLeast(1).map(function (x) {
                return x.reduce(function (a, b) { return join([a, mapper("br")(null), b]); });
            }).map(mapper("p")).map(mapper("blockquote")).skip(whitespace.many());
        });
        var pluginBlock = P.seqMap(P.string("@["), P.regexp(/[a-zA-Z]+/), P.regexp(/(:[^\]]*)*/), P.string("]\n"), P.seq(P.string("  ").result(""), P.regexp(/[^\r\n]+/), linebreak.atMost(1).result("\n")).map(join).atLeast(1).map(join), function (_1, pluginName, args, _2, content) {
            return _this.opts.plugins && _this.opts.plugins[pluginName] ? _this.opts.plugins[pluginName](args, content) : join([_1, pluginName, args, _2, content]);
        });
        var block = P.alt(P.regexp(/\s+/).result(""), pluginBlock, lists, h1Special, h2Special, h6, h5, h4, h3, h2, h1, table, codeBlock, blockquote, paragraph, linebreak.result(""));
        this.acceptables = P.alt(block).many().map(join);
    };
    Parser.prototype.parse = function (s) {
        this.liLevelBefore = this.liLevel = null;
        this.rootTree = this.currentTree = {
            value: null,
            children: [],
            type: "shadow",
            parent: null
        };
        var parsed = this.acceptables.parse(s.trim());
        if (parsed.hasOwnProperty("value"))
            return parsed.value;
        console.error(s.trim());
        console.error(parsed);
        throw new Error("Parsing was failed.");
    };
    return Parser;
}());
exports.Parser = Parser;
exports.asHTML = {
    mapper: function (tag, args) { return function (children) { return [
        "<" + tag,
        args ? " " + Object.keys(args).map(function (x) { return (x + "=\"" + args[x] + "\""); }).join(" ") : "",
        children ? ">" + children + "</" + tag + ">" : " />"
    ].join(""); }; },
    join: function (x) { return x.join(""); }
};
exports.asAST = {
    mapper: function (tag, args) { return function (children) { return [
        tag,
        args ? args : null,
        children
    ]; }; },
    join: function (x) { return x; } // identical
};
var p = new Parser({
    export: exports.asHTML,
});
exports.parse = function (s) {
    return p.parse(s);
};
