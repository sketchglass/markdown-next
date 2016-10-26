"use strict";
var P = require("parsimmon");
var whitespace = P.regexp(/\s+/m);
var asterisk = P.string("*");
var sharp = P.string("#");
var plainStr = P.regexp(/[^`\*\r\n]+/);
var linebreak = P.string("\r\n").or(P.string("\n")).or(P.string("\r"));
var surroundWith = function (tag) {
    return function (s) {
        return "<" + tag + ">" + s + "</" + tag + ">";
    };
};
var token = function (p) {
    return p.skip(P.regexp(/\s*/m));
};
var h1 = token(P.seq(sharp, whitespace).then(plainStr)).map(surroundWith("h1"));
var h2 = token(P.seq(sharp.times(2), whitespace).then(plainStr)).map(surroundWith("h2"));
var h3 = token(P.seq(sharp.times(3), whitespace).then(plainStr)).map(surroundWith("h3"));
var h4 = token(P.seq(sharp.times(4), whitespace).then(plainStr)).map(surroundWith("h4"));
var h5 = token(P.seq(sharp.times(5), whitespace).then(plainStr)).map(surroundWith("h5"));
var h6 = token(P.seq(sharp.times(6), whitespace).then(plainStr)).map(surroundWith("h6"));
var strongStart = P.string("**");
var strongEnd = strongStart;
var strong = strongStart
    .then(plainStr)
    .map(surroundWith("strong"))
    .skip(strongEnd);
var emStart = P.string("*");
var emEnd = emStart;
var em = emStart
    .then(plainStr)
    .map(surroundWith("em"))
    .skip(emEnd);
var anchor = P.seqMap(P.string("["), P.regexp(/[^\]\r\n]+/), P.string("]("), P.regexp(/[^\)\r\n]+/), P.string(")"), function (_1, label, _2, target, _3) {
    return "<a href=\"" + target + "\">" + label + "</a>";
});
var codeStart = P.string("`");
var codeEnd = P.string("`");
var code = codeStart
    .then(plainStr)
    .map(surroundWith("code"))
    .skip(codeEnd);
var paragraphStr = P.regexp(/[^\r\n\[\]\*`]+/);
var inline = P.alt(anchor, em, strong, code, paragraphStr);
var paragraph = inline.atLeast(1).map(function (x) { return x.join(""); }).map(surroundWith("p"));
var paragraphStart = P.regexp(/^(?!(#|```))/);
var paragraphBreak = linebreak.atLeast(2).result("");
var paragraphOrLinebreak = paragraph
    .or(paragraphBreak)
    .atLeast(1)
    .map(function (x) { return x.join(""); });
var ul = P.string("- ").then(plainStr).skip(linebreak.many()).atLeast(1)
    .map(function (x) { return surroundWith("ul")(x.map(surroundWith("li")).join("")); });
var ol = P.regexp(/[0-9]+\. /).then(plainStr).skip(linebreak.many()).atLeast(1)
    .map(function (x) { return surroundWith("ol")(x.map(surroundWith("li")).join("")); });
var lists = ul.or(ol);
var codeBlockBegin = linebreak.atMost(1).then(P.string("```"));
var codeBlockEnd = P.string("```").skip(linebreak.atMost(1));
var codeBlockDefinitionStr = P.regexp(/[^`\r\n]*/);
var codeBlockStr = P.regexp(/[^`\r\n]+/);
var codeBlock = P.seqMap(codeBlockBegin, codeBlockDefinitionStr, linebreak, linebreak.or(codeBlockStr.skip(linebreak)).many(), codeBlockEnd, function (_1, definition, _2, code, _3) {
    return "<pre><code>" + code.join("") + "</code></pre>";
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
            return surroundWith("blockquote")(s);
        return s;
    });
});
var blockquote = P.lazy(function () {
    // must be initialized each time this function is called.
    blockquoteLevel = null;
    createBlockquote = false;
    return blockquoteLine.atLeast(1).map(function (x) { return x.join("<br />"); }).map(surroundWith("p")).map(surroundWith("blockquote")).skip(whitespace.many());
});
var acceptables = P.alt(h6, h5, h4, h3, h2, h1, lists, codeBlock, blockquote, paragraphOrLinebreak, linebreak.result("<br />")).many().map(function (x) { return x.join(""); });
exports.parse = function (s) {
    var parsed = acceptables.parse(s);
    if (parsed.hasOwnProperty("value"))
        return parsed.value;
    console.error(parsed);
    throw new Error("Parsing was failed.");
};
