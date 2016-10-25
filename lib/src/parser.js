"use strict";
var P = require("parsimmon");
var whitespace = P.regexp(/\s+/m);
var asterisk = P.string("*");
var sharp = P.string("#");
var plainStr = P.regexp(/[^\*\r\n]+/);
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
var inline = em.or(strong).or(plainStr);
var paragraph = inline.atLeast(1).map(function (x) { return x.join(""); }).map(surroundWith("p"));
var paragraphStart = P.regexp(/^(?!(#|```))/);
var paragraphBreak = linebreak.atLeast(2).result("");
var paragraphOrLinebreak = paragraph
    .or(paragraphBreak)
    .atLeast(1)
    .map(function (x) { return x.join(""); });
var acceptables = P.alt(h6, h5, h4, h3, h2, h1, paragraphOrLinebreak, whitespace.result("<br />")).many().map(function (x) { return x.join(""); });
exports.parse = function (s) {
    var parsed = acceptables.parse(s);
    if (parsed.hasOwnProperty("value"))
        return parsed.value;
    throw new Error("Parsing was failed.");
};
