/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var parse = __webpack_require__(1).parse
	var elem = document.getElementById("textarea")
	var preview = document.getElementById("preview")

	elem.addEventListener("keydown", function(e) {
	  try {
	    preview.innerHTML = parse(elem.value)
	  } catch(e) {
	    console.error(e)
	  }
	})


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var P = __webpack_require__(2);
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
	        var join = this.opts.type.join;
	        var mapper = this.opts.type.mapper;
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
	        var inline = P.alt(anchor, img, em, strong, code, P.regexp(/[^\r\n=-\[\]\*\`]+/), P.regexp(/./));
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
	        var block = P.alt(P.regexp(/\s+/).result(""), lists, h1Special, h2Special, h6, h5, h4, h3, h2, h1, table, codeBlock, blockquote, paragraph, linebreak.result(""));
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
	    type: exports.asHTML,
	});
	exports.parse = function (s) {
	    return p.parse(s);
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(t,n){if(true){!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (n), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))}else if(typeof module==="object"&&module.exports){module.exports=n()}else{t.Parsimmon=n()}})(this,function(){"use strict";function t(n){if(!(this instanceof t)){return new t(n)}this._=n}function n(n){return n instanceof t}var r=t.prototype;function e(t,n){return{status:true,index:t,value:n,furthest:-1,expected:[]}}function u(t,n){return{status:false,index:-1,value:null,furthest:t,expected:[n]}}function a(t,n){if(!n){return t}if(t.furthest>n.furthest){return t}var r=t.furthest===n.furthest?i(t.expected,n.expected):n.expected;return{status:t.status,index:t.index,value:t.value,furthest:n.furthest,expected:r}}function i(t,n){var r=t.length;var e=n.length;if(r===0){return n}else if(e===0){return t}var u={};for(var a=0;a<r;a++){u[t[a]]=true}for(var i=0;i<e;i++){u[n[i]]=true}var f=[];for(var o in u){if(u.hasOwnProperty(o)){f.push(o)}}f.sort();return f}function f(t){if(!n(t)){throw new Error("not a parser: "+t)}}function o(t){if(typeof t!=="number"){throw new Error("not a number: "+t)}}function s(t){if(!(t instanceof RegExp)){throw new Error("not a regexp: "+t)}var n=_(t);for(var r=0;r<n.length;r++){var e=n.charAt(r);if(e!="i"&&e!="m"&&e!="u"){throw new Error('unsupported regexp flag "'+e+'": '+t)}}}function c(t){if(typeof t!=="function"){throw new Error("not a function: "+t)}}function l(t){if(typeof t!=="string"){throw new Error("not a string: "+t)}}function h(t){if(t.length===1){return t[0]}return"one of "+t.join(", ")}function v(t,n){var r=n.index;var e=r.offset;if(e===t.length){return", got the end of the input"}var u=e>0?"'...":"'";var a=t.length-e>12?"...'":"'";return" at line "+r.line+" column "+r.column+", got "+u+t.slice(e,e+12)+a}function p(t,n){return"expected "+h(n.expected)+v(t,n)}r.parse=function(t){if(typeof t!=="string"){throw new Error(".parse must be called with a string as its argument")}var n=this.skip(z)._(t,0);return n.status?{status:true,value:n.value}:{status:false,index:R(t,n.furthest),expected:n.expected}};r.tryParse=function(t){var n=this.parse(t);if(n.status){return n.value}else{var r=p(t,n);var e=new Error(r);e.type="ParsimmonError";e.result=n;throw e}};function d(){var n=[].slice.call(arguments);var r=n.length;for(var u=0;u<r;u+=1){f(n[u])}return t(function(t,u){var i;var f=new Array(r);for(var o=0;o<r;o+=1){i=a(n[o]._(t,u),i);if(!i.status){return i}f[o]=i.value;u=i.index}return a(e(u,f),i)})}function g(){var t=[].slice.call(arguments);if(t.length===0){throw new Error("seqMap needs at least one argument")}var n=t.pop();c(n);return d.apply(null,t).map(function(t){return n.apply(null,t)})}function m(n){return t(n(e,u))}function y(){var n=[].slice.call(arguments);var r=n.length;if(r===0){return b("zero alternates")}for(var e=0;e<r;e+=1){f(n[e])}return t(function(t,r){var e;for(var u=0;u<n.length;u+=1){e=a(n[u]._(t,r),e);if(e.status)return e}return e})}function x(t,n){return w(t,n).or(O([]))}function w(t,n){f(t);f(n);var r=n.then(t).many();return t.chain(function(t){return r.map(function(n){return[t].concat(n)})})}r.or=function(t){return y(this,t)};r.then=function(t){if(typeof t==="function"){throw new Error("chaining features of .then are no longer supported, use .chain instead")}f(t);return d(this,t).map(function(t){return t[1]})};r.many=function(){var n=this;return t(function(t,r){var u=[];var i=undefined;for(;;){i=a(n._(t,r),i);if(i.status){r=i.index;u.push(i.value)}else{return a(e(r,u),i)}}})};r.times=function(n,r){var u=this;if(arguments.length<2){r=n}o(n);o(r);return t(function(t,i){var f=[];var o=undefined;var s=undefined;for(var c=0;c<n;c+=1){o=u._(t,i);s=a(o,s);if(o.status){i=o.index;f.push(o.value)}else{return s}}for(;c<r;c+=1){o=u._(t,i);s=a(o,s);if(o.status){i=o.index;f.push(o.value)}else{break}}return a(e(i,f),s)})};r.result=function(t){return this.map(function(){return t})};r.atMost=function(t){return this.times(0,t)};r.atLeast=function(t){return g(this.times(t),this.many(),function(t,n){return t.concat(n)})};r.map=function(n){c(n);var r=this;return t(function(t,u){var i=r._(t,u);if(!i.status){return i}return a(e(i.index,n(i.value)),i)})};r["fantasy-land/map"]=r.map;r.skip=function(t){return d(this,t).map(function(t){return t[0]})};r.mark=function(){return g(W,this,W,function(t,n,r){return{start:t,value:n,end:r}})};r.desc=function(n){var r=this;return t(function(t,e){var u=r._(t,e);if(!u.status){u.expected=[n]}return u})};r.fallback=function(t){return this.or(O(t))};function E(n){l(n);var r="'"+n+"'";return t(function(t,a){var i=a+n.length;var f=t.slice(a,i);if(f===n){return e(i,f)}else{return u(a,r)}})}function _(t){var n=""+t;return n.slice(n.lastIndexOf("/")+1)}function k(n,r){s(n);if(arguments.length>=2){o(r)}else{r=0}var a=RegExp("^(?:"+n.source+")",_(n));var i=""+n;return t(function(t,n){var f=a.exec(t.slice(n));if(f){var o=f[0];var s=f[r];if(s!=null){return e(n+o.length,s)}}return u(n,i)})}function O(n){return t(function(t,r){return e(r,n)})}function b(n){return t(function(t,r){return u(r,n)})}var P=t(function(t,n){if(n>=t.length){return u(n,"any character")}return e(n+1,t.charAt(n))});var A=t(function(t,n){return e(t.length,t.slice(n))});var z=t(function(t,n){if(n<t.length){return u(n,"EOF")}return e(n,null)});function q(n){c(n);return t(function(t,r){var a=t.charAt(r);if(r<t.length&&n(a)){return e(r+1,a)}else{return u(r,"a character matching "+n)}})}function M(t){return q(function(n){return t.indexOf(n)>=0})}function j(t){return q(function(n){return t.indexOf(n)<0})}function B(n){c(n);return t(function(t,r){var u=r;while(u<t.length&&n(t.charAt(u))){u++}return e(u,t.slice(r,u))})}function F(n,r){if(arguments.length<2){r=n;n=undefined}var e=t(function(t,n){e._=r()._;return e._(t,n)});if(n){return e.desc(n)}else{return e}}function R(t,n){var r=t.slice(0,n).split("\n");var e=r.length;var u=r[r.length-1].length+1;return{offset:n,line:e,column:u}}var W=t(function(t,n){return e(n,R(t,n))});function I(){return b("fantasy-land/empty")}r.concat=r.or;r["fantasy-land/concat"]=r.concat;r.empty=I;r["fantasy-land/empty"]=r.empty;r.of=O;r["fantasy-land/of"]=r.of;r.ap=function(t){return g(t,this,function(t,n){return t(n)})};r["fantasy-land/ap"]=r.ap;r.chain=function(n){var r=this;return t(function(t,e){var u=r._(t,e);if(!u.status){return u}var i=n(u.value);return a(i._(t,u.index),u)})};r["fantasy-land/chain"]=r.chain;var L=k(/[0-9]/).desc("a digit");var S=k(/[0-9]*/).desc("optional digits");var C=k(/[a-z]/i).desc("a letter");var D=k(/[a-z]*/i).desc("optional letters");var G=k(/\s*/).desc("optional whitespace");var H=k(/\s+/).desc("whitespace");t.all=A;t.alt=y;t.any=P;t.custom=m;t.digit=L;t.digits=S;t.eof=z;t.fail=b;t.formatError=p;t.index=W;t.isParser=n;t.lazy=F;t.letter=C;t.letters=D;t.makeFailure=u;t.makeSuccess=e;t.noneOf=j;t.oneOf=M;t.optWhitespace=G;t.Parser=t;t.regex=k;t.regexp=k;t.sepBy=x;t.sepBy1=w;t.seq=d;t.seqMap=g;t.string=E;t.succeed=O;t.takeWhile=B;t.test=q;t.whitespace=H;t.empty=I;t["fantasy-land/empty"]=I;t.of=O;t["fantasy-land/of"]=O;return t});


/***/ }
/******/ ]);