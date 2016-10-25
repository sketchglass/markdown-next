"use strict";
var assert = require('power-assert');
var parser_1 = require("../src/parser");
describe("parser", function () {
    it('should parse h1', function () {
        var input = "# header";
        var expect = "<h1>header</h1>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse h2', function () {
        var input = "## header";
        var expect = "<h2>header</h2>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse h3', function () {
        var input = "### header";
        var expect = "<h3>header</h3>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse h4', function () {
        var input = "#### header";
        var expect = "<h4>header</h4>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse h5', function () {
        var input = "##### header";
        var expect = "<h5>header</h5>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse h6', function () {
        var input = "###### header";
        var expect = "<h6>header</h6>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse single line as a paragraph', function () {
        var input = "para1";
        var expect = "<p>para1</p>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse a paragraph', function () {
        var input = "para1\n\npara2";
        var expect = "<p>para1</p><p>para2</p>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse a paragraph', function () {
        var input = "para1\n\n\npara2";
        var expect = "<p>para1</p><p>para2</p>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse strong text inside a paragraph', function () {
        var input = "this should be **strong**";
        var expect = "<p>this should be <strong>strong</strong></p>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse strong text a single phrase', function () {
        var input = "**strong**";
        var expect = "<p><strong>strong</strong></p>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse em text a single phrase', function () {
        var input = "*em*";
        var expect = "<p><em>em</em></p>";
        assert.equal(parser_1.parse(input), expect);
    });
    it('should parse complex text', function () {
        var input = "\n# header1\nparagraph";
        var expect = "<br /><h1>header1</h1><p>paragraph</p>";
        assert.equal(parser_1.parse(input), expect);
    });
});
