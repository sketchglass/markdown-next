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
	var whitespace = P.regexp(/\s+/m);
	var asterisk = P.string("*");
	var sharp = P.string("#");
	var plainStr = P.regexp(/[^`_\*\r\n]+/);
	var linebreak = P.string("\r\n").or(P.string("\n")).or(P.string("\r"));
	var equal = P.string("=");
	var minus = P.string("-");
	var surroundWith = function (tag) {
	    return function (s) {
	        return "<" + tag + ">" + s + "</" + tag + ">";
	    };
	};
	var token = function (p) {
	    return p.skip(P.regexp(/\s*/m));
	};
	var h1Special = P.regexp(/^(.*)\n\=+/, 1)
	    .skip(P.alt(P.eof, P.string("\n")))
	    .map(surroundWith("h1"));
	var h2Special = P.regexp(/^(.*)\n\-+/, 1)
	    .skip(P.alt(P.eof, P.string("\n")))
	    .map(surroundWith("h2"));
	var h1 = token(P.seq(sharp, whitespace).then(plainStr)).map(surroundWith("h1"));
	var h2 = token(P.seq(sharp.times(2), whitespace).then(plainStr)).map(surroundWith("h2"));
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
	var inline = P.alt(anchor, img, em, strong, code, P.regexp(/^(?!```)./));
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
	var paragraph = P.lazy(function () {
	    return P.seq(paragraphLine, linebreak.result("<br />"), paragraphLine)
	        .map(function (x) { return x.join(""); })
	        .or(paragraphLine)
	        .map(surroundWith("p"));
	});
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
	var codeBlockBegin = P.regexp(/^```/);
	var codeBlockEnd = P.regexp(/^```/);
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
	var block = P.alt(lists, h1Special, h2Special, h6, h5, h4, h3, h2, h1, table, codeBlock, blockquote, paragraph);
	var acceptables = P.alt(block, linebreak.result("")).many().map(function (x) { return x.join(""); });
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(r,t){if(true){!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (t), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))}else if(typeof module==="object"&&module.exports){module.exports=t()}else{r.Parsimmon=t()}})(this,function(){"use strict";var r={};function t(r){if(!(this instanceof t))return new t(r);this._=r}r.Parser=t;var n=t.prototype;function e(r,t){return{status:true,index:r,value:t,furthest:-1,expected:[]}}function u(r,t){return{status:false,index:-1,value:null,furthest:r,expected:[t]}}function a(r,t){if(!t)return r;if(r.furthest>t.furthest)return r;var n=r.furthest===t.furthest?i(r.expected,t.expected):t.expected;return{status:r.status,index:r.index,value:r.value,furthest:t.furthest,expected:n}}function i(r,t){var n=r.length;var e=t.length;if(n===0){return t}else if(e===0){return r}var u={};for(var a=0;a<n;a++){u[r[a]]=true}for(var a=0;a<e;a++){u[t[a]]=true}var i=[];for(var f in u){if(u.hasOwnProperty(f)){i.push(f)}}i.sort();return i}function f(r){if(!(r instanceof t)){throw new Error("not a parser: "+r)}}function o(r){if(typeof r!=="number"){throw new Error("not a number: "+r)}}function s(r){if(!(r instanceof RegExp)){throw new Error("not a regexp: "+r)}var t=E(r);for(var n=0;n<t.length;n++){var e=t.charAt(n);if(e!="i"&&e!="m"&&e!="u"){throw new Error('unsupported regexp flag "'+e+'": '+r)}}}function c(r){if(typeof r!=="function"){throw new Error("not a function: "+r)}}function v(r){if(typeof r!=="string"){throw new Error("not a string: "+r)}}function l(r){if(r.length===1)return r[0];return"one of "+r.join(", ")}function h(r,t){var n=t.index;var e=n.offset;if(e===r.length)return", got the end of the stream";var u=e>0?"'...":"'";var a=r.length-e>12?"...'":"'";return" at line "+n.line+" column "+n.column+", got "+u+r.slice(e,e+12)+a}var p=r.formatError=function(r,t){return"expected "+l(t.expected)+h(r,t)};n.parse=function(r){if(typeof r!=="string"){throw new Error(".parse must be called with a string as its argument")}var t=this.skip(W)._(r,0);return t.status?{status:true,value:t.value}:{status:false,index:G(r,t.furthest),expected:t.expected}};var d=r.seq=function(){var r=[].slice.call(arguments);var n=r.length;for(var u=0;u<n;u+=1){f(r[u])}return t(function(t,u){var i;var f=new Array(n);for(var o=0;o<n;o+=1){i=a(r[o]._(t,u),i);if(!i.status)return i;f[o]=i.value;u=i.index}return a(e(u,f),i)})};var g=r.seqMap=function(){var r=[].slice.call(arguments);if(r.length===0){throw new Error("seqMap needs at least one argument")}var t=r.pop();c(t);return d.apply(null,r).map(function(r){return t.apply(null,r)})};var x=r.custom=function(r){return t(r(e,u))};var m=r.alt=function(){var r=[].slice.call(arguments);var n=r.length;if(n===0)return k("zero alternates");for(var e=0;e<n;e+=1){f(r[e])}return t(function(t,n){var e;for(var u=0;u<r.length;u+=1){e=a(r[u]._(t,n),e);if(e.status)return e}return e})};var w=r.sepBy=function(t,n){return y(t,n).or(r.of([]))};var y=r.sepBy1=function(r,t){f(r);f(t);var n=t.then(r).many();return r.chain(function(r){return n.map(function(t){return[r].concat(t)})})};n.or=function(r){return m(this,r)};n.then=function(r){if(typeof r==="function"){throw new Error("chaining features of .then are no longer supported, use .chain instead")}f(r);return d(this,r).map(function(r){return r[1]})};n.many=function(){var r=this;return t(function(t,n){var u=[];var i;var f;for(;;){i=a(r._(t,n),i);if(i.status){n=i.index;u.push(i.value)}else{return a(e(n,u),i)}}})};n.times=function(r,n){if(arguments.length<2)n=r;var u=this;o(r);o(n);return t(function(t,i){var f=[];var o=i;var s;var c;for(var v=0;v<r;v+=1){s=u._(t,i);c=a(s,c);if(s.status){i=s.index;f.push(s.value)}else return c}for(;v<n;v+=1){s=u._(t,i);c=a(s,c);if(s.status){i=s.index;f.push(s.value)}else break}return a(e(i,f),c)})};n.result=function(r){return this.map(function(t){return r})};n.atMost=function(r){return this.times(0,r)};n.atLeast=function(r){var t=this;return g(this.times(r),this.many(),function(r,t){return r.concat(t)})};n.map=function(r){c(r);var n=this;return t(function(t,u){var i=n._(t,u);if(!i.status)return i;return a(e(i.index,r(i.value)),i)})};n.skip=function(r){return d(this,r).map(function(r){return r[0]})};n.mark=function(){return g(H,this,H,function(r,t,n){return{start:r,value:t,end:n}})};n.desc=function(r){var n=this;return t(function(t,e){var u=n._(t,e);if(!u.status)u.expected=[r];return u})};var _=r.string=function(r){var n=r.length;var a="'"+r+"'";v(r);return t(function(t,i){var f=t.slice(i,i+n);if(f===r){return e(i+n,f)}else{return u(i,a)}})};var E=function(r){var t=""+r;return t.slice(t.lastIndexOf("/")+1)};var O=r.regexp=function(r,n){s(r);if(arguments.length>=2){o(n)}else{n=0}var a=RegExp("^(?:"+r.source+")",E(r));var i=""+r;return t(function(r,t){var f=a.exec(r.slice(t));if(f){var o=f[0];var s=f[n];if(s!=null){return e(t+o.length,s)}}return u(t,i)})};r.regex=O;var b=r.succeed=function(r){return t(function(t,n){return e(n,r)})};var k=r.fail=function(r){return t(function(t,n){return u(n,r)})};var A=r.letter=O(/[a-z]/i).desc("a letter");var z=r.letters=O(/[a-z]*/i);var q=r.digit=O(/[0-9]/).desc("a digit");var M=r.digits=O(/[0-9]*/);var P=r.whitespace=O(/\s+/).desc("whitespace");var j=r.optWhitespace=O(/\s*/);var B=r.any=t(function(r,t){if(t>=r.length)return u(t,"any character");return e(t+1,r.charAt(t))});var R=r.all=t(function(r,t){return e(r.length,r.slice(t))});var W=r.eof=t(function(r,t){if(t<r.length)return u(t,"EOF");return e(t,null)});var F=r.test=function(r){c(r);return t(function(t,n){var a=t.charAt(n);if(n<t.length&&r(a)){return e(n+1,a)}else{return u(n,"a character matching "+r)}})};var I=r.oneOf=function(r){return F(function(t){return r.indexOf(t)>=0})};var L=r.noneOf=function(r){return F(function(t){return r.indexOf(t)<0})};var C=r.takeWhile=function(r){c(r);return t(function(t,n){var u=n;while(u<t.length&&r(t.charAt(u)))u+=1;return e(u,t.slice(n,u))})};var D=r.lazy=function(r,n){if(arguments.length<2){n=r;r=undefined}var e=t(function(r,t){e._=n()._;return e._(r,t)});if(r)e=e.desc(r);return e};var G=function(r,t){var n=r.slice(0,t).split("\n");var e=n.length;var u=n[n.length-1].length+1;return{offset:t,line:e,column:u}};var H=r.index=t(function(r,t){return e(t,G(r,t))});n.concat=n.or;n.empty=k("empty");n.of=t.of=r.of=b;n.ap=function(r){return g(this,r,function(r,t){return r(t)})};n.chain=function(r){var n=this;return t(function(t,e){var u=n._(t,e);if(!u.status)return u;var i=r(u.value);return a(i._(t,u.index),u)})};return r});


/***/ }
/******/ ]);