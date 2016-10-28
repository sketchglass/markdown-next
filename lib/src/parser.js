"use strict";
var P = require("parsimmon");
var whitespace = P.regexp(/\s+/m);
var asterisk = P.string("*");
var sharp = P.string("#");
var plainStr = P.regexp(/[^`_\*\r\n]+/);
var linebreak = P.string("\r\n").or(P.string("\n")).or(P.string("\r"));
var equal = P.string("=");
var minus = P.string("-");
var paragraphStr = P.regexp(/(?![0-9]. )^[^\r\n\[\]\*\#\-`=][^\r\n\[\]\*`]*/);
var surroundWith = function (tag) {
    return function (s) {
        return "<" + tag + ">" + s + "</" + tag + ">";
    };
};
var token = function (p) {
    return p.skip(P.regexp(/\s*/m));
};
var h1Regex = P.regexp(/^(.*)\n\=+/, 1);
var h2Regex = P.regexp(/^(.*)\n\-+/, 1);
var h1 = token(P.seq(sharp, whitespace).then(plainStr).or(h1Regex)).map(surroundWith("h1"));
var h2 = token(P.seq(sharp.times(2), whitespace).then(plainStr).or(h2Regex)).map(surroundWith("h2"));
var h3 = token(P.seq(sharp.times(3), whitespace).then(plainStr)).map(surroundWith("h3"));
var h4 = token(P.seq(sharp.times(4), whitespace).then(plainStr)).map(surroundWith("h4"));
var h5 = token(P.seq(sharp.times(5), whitespace).then(plainStr)).map(surroundWith("h5"));
var h6 = token(P.seq(sharp.times(6), whitespace).then(plainStr)).map(surroundWith("h6"));
var strongStart = P.string("**").or(P.string("__"));
var strongEnd = strongStart;
var strong = strongStart
    .then(plainStr)
    .map(surroundWith("strong"))
    .skip(strongEnd);
var emStart = P.string("*").or(P.string("_"));
var emEnd = emStart;
var em = emStart
    .then(plainStr)
    .map(surroundWith("em"))
    .skip(emEnd);
var anchor = P.seqMap(P.string("["), P.regexp(/[^\]\r\n]+/), P.string("]("), P.regexp(/[^\)\r\n]+/), P.string(")"), function (_1, label, _2, target, _3) {
    return "<a href=\"" + target + "\">" + label + "</a>";
});
var img = P.seqMap(P.string("!["), P.regexp(/[^\]\r\n]+/), P.string("]("), P.regexp(/[^\)\r\n]+/), P.string(")"), function (_1, alt, _2, url, _3) {
    return "<img src=\"" + url + "\" alt=\"" + alt + "\" />";
});
var codeStart = P.string("`");
var codeEnd = P.string("`");
var code = codeStart
    .then(plainStr)
    .map(surroundWith("code"))
    .skip(codeEnd);
var inline = P.alt(anchor, img, em, strong, code, paragraphStr);
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
var table = P.seqMap(tableHeader, tableHSep, tableBody.atLeast(1), function (headers, _1, bodies) {
    var res = "<table><tr>";
    for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
        var h = headers_1[_i];
        res += "<th>" + h + "</th>";
    }
    res += "</tr>";
    for (var _a = 0, bodies_1 = bodies; _a < bodies_1.length; _a++) {
        var b = bodies_1[_a];
        res += "<tr>";
        for (var _b = 0, b_1 = b; _b < b_1.length; _b++) {
            var x = b_1[_b];
            res += "<td>" + x + "</td>";
        }
        res += "</tr>";
    }
    res += "</table>";
    return res;
});
var paragraphLine = inline.atLeast(1).map(function (x) { return x.join(""); });
var paragraph = P.seq(paragraphLine, linebreak.result("<br />"), paragraphLine).map(function (x) { return x.join(""); }).or(paragraphLine).map(surroundWith("p"));
var paragraphBreak = linebreak.atLeast(2).result("");
var paragraphOrLinebreak = P.seq(paragraph, paragraphBreak).map(function (x) { return x.join(""); })
    .or(paragraph);
var listIndent = P.string("  ");
var liSingleLine = plainStr;
var ulStart = P.string("- ").or(P.string("* "));
var olStart = P.regexp(/[0-9]+\. /);
var liLevel = null;
var liLevelBefore = null;
var rootTree;
var currentTree;
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
        currentTree.children.push({
            value: x,
            children: [],
            type: nodeType,
            parent: currentTree
        });
    }
    else if (liLevelBefore < liLevel) {
        var currentTreeIndex = currentTree.children.length - 1;
        currentTree = currentTree.children[currentTreeIndex];
        currentTree.children.push({
            children: [],
            type: nodeType,
            parent: currentTree,
            value: x
        });
    }
    else if (liLevelBefore > liLevel) {
        if (currentTree.parent !== null) {
            currentTree = currentTree.parent;
        }
        currentTree.children.push({
            type: nodeType,
            children: [],
            parent: currentTree,
            value: x
        });
    }
    var _nodeType = nodeType;
    return _nodeType;
});
var lists = listLineContent.atLeast(1).skip(linebreak.atMost(1)).map(function (nodeTypes) {
    rootTree.type = nodeTypes[0];
    var result = treeToHtml(rootTree);
    rootTree = currentTree = {
        value: null,
        children: [],
        type: "shadow",
        parent: null
    };
    return result;
});
var treeToHtml = function (treeOrNode) {
    if (treeOrNode.type === "shadow") {
        return treeOrNode.children.map(treeToHtml).join("");
    }
    else if (treeOrNode.children.length === 0 && treeOrNode.value !== null) {
        return "<li>" + treeOrNode.value + "</li>";
    }
    else if (treeOrNode.children.length !== 0 && treeOrNode.value !== null) {
        var children = treeOrNode.children;
        var before_1 = "<" + treeOrNode.children[0].type + ">";
        var after_1 = "</" + treeOrNode.children[0].type + ">";
        return "<li>" + treeOrNode.value + before_1 + children.map(treeToHtml).join("") + after_1 + "</li>";
    }
    else {
        var before_2 = "<" + treeOrNode.type + ">";
        var after_2 = "</" + treeOrNode.type + ">";
        var children = treeOrNode.children;
        return before_2 + children.map(treeToHtml).join("") + after_2;
    }
};
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
    blockquoteLevel = null;
    createBlockquote = false;
    return blockquoteLine.atLeast(1).map(function (x) { return x.join("<br />"); }).map(surroundWith("p")).map(surroundWith("blockquote")).skip(whitespace.many());
});
var acceptables = P.alt(lists, h6, h5, h4, h3, h2, h1, table, codeBlock, blockquote, paragraphOrLinebreak, linebreak.result("")).many().map(function (x) { return x.join(""); });
exports.parse = function (s) {
    liLevelBefore = liLevel = null;
    rootTree = currentTree = {
        value: null,
        children: [],
        type: "shadow",
        parent: null
    };
    var parsed = acceptables.parse(s);
    if (parsed.hasOwnProperty("value"))
        return parsed.value;
    console.error(parsed);
    throw new Error("Parsing was failed.");
};
