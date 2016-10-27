"use strict";
var assert = require("power-assert");
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
        var input2 = "# Lorem Ipsum\n\n`Lorem ipsum dolor` sit amet, [consectetur](http://example.com) **adipiscing** elit. Pellentesque at urna diam. Ut vulputate ornare egestas. Vivamus fringilla molestie aliquam. Pellentesque elit dui, mollis nec augue vitae, lacinia iaculis dolor. Curabitur placerat tortor ut mauris consequat rhoncus. Sed nec nibh et diam dictum blandit. Morbi quis finibus nulla. Suspendisse sit amet tincidunt nisi. Morbi lacinia molestie purus eget dignissim. Maecenas pharetra elit tellus, ac congue dui finibus sit amet. Vivamus tempus at mauris vitae euismod. Cras lacus nulla, fermentum at varius vitae, varius ac elit. Nulla sit amet nibh in augue feugiat ultricies. Praesent eget mi imperdiet, dapibus augue sed, porttitor nulla. Nunc sed sodales ex. Nullam ut magna eget lectus luctus dapibus.\n\nInteger odio augue, rhoncus non velit ac, ultricies ornare libero. Vivamus fermentum lectus nec diam accumsan, in sodales leo pulvinar. Quisque eu sapien mauris. Integer sagittis cursus massa id eleifend. Vestibulum dignissim eleifend felis, in laoreet neque egestas at. Etiam elementum vel mauris id iaculis. Duis blandit at sapien ac viverra. Proin ac erat a mauris dignissim semper quis vel libero. In id massa id nibh malesuada ornare non volutpat risus. Pellentesque sem nibh, vehicula a dolor quis, volutpat sagittis magna. Mauris ipsum arcu, tempus vel sollicitudin ac, consectetur sed magna. Praesent tempor varius justo vitae convallis. Nam pharetra, lacus quis ultrices vehicula, risus arcu porta libero, ac pretium ex elit in nisl. Integer urna ante, hendrerit sollicitudin convallis et, finibus nec odio.\n\nMorbi viverra lacus tortor, eu consectetur ante tempor quis. Fusce eu eros et nisi volutpat efficitur. Proin euismod id eros ut eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed fermentum libero, ultrices commodo mi. Praesent auctor quis purus ut tristique. Mauris quis nunc nec augue congue dignissim eu et neque. Suspendisse potenti. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.\n```\ncode block\n```\n";
        var expect2 = "<h1>Lorem Ipsum</h1><p><code>Lorem ipsum dolor</code> sit amet, <a href=\"http://example.com\">consectetur</a> <strong>adipiscing</strong> elit. Pellentesque at urna diam. Ut vulputate ornare egestas. Vivamus fringilla molestie aliquam. Pellentesque elit dui, mollis nec augue vitae, lacinia iaculis dolor. Curabitur placerat tortor ut mauris consequat rhoncus. Sed nec nibh et diam dictum blandit. Morbi quis finibus nulla. Suspendisse sit amet tincidunt nisi. Morbi lacinia molestie purus eget dignissim. Maecenas pharetra elit tellus, ac congue dui finibus sit amet. Vivamus tempus at mauris vitae euismod. Cras lacus nulla, fermentum at varius vitae, varius ac elit. Nulla sit amet nibh in augue feugiat ultricies. Praesent eget mi imperdiet, dapibus augue sed, porttitor nulla. Nunc sed sodales ex. Nullam ut magna eget lectus luctus dapibus.</p><p>Integer odio augue, rhoncus non velit ac, ultricies ornare libero. Vivamus fermentum lectus nec diam accumsan, in sodales leo pulvinar. Quisque eu sapien mauris. Integer sagittis cursus massa id eleifend. Vestibulum dignissim eleifend felis, in laoreet neque egestas at. Etiam elementum vel mauris id iaculis. Duis blandit at sapien ac viverra. Proin ac erat a mauris dignissim semper quis vel libero. In id massa id nibh malesuada ornare non volutpat risus. Pellentesque sem nibh, vehicula a dolor quis, volutpat sagittis magna. Mauris ipsum arcu, tempus vel sollicitudin ac, consectetur sed magna. Praesent tempor varius justo vitae convallis. Nam pharetra, lacus quis ultrices vehicula, risus arcu porta libero, ac pretium ex elit in nisl. Integer urna ante, hendrerit sollicitudin convallis et, finibus nec odio.</p><p>Morbi viverra lacus tortor, eu consectetur ante tempor quis. Fusce eu eros et nisi volutpat efficitur. Proin euismod id eros ut eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed fermentum libero, ultrices commodo mi. Praesent auctor quis purus ut tristique. Mauris quis nunc nec augue congue dignissim eu et neque. Suspendisse potenti. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p><pre><code>code block</code></pre>";
        assert.equal(parser_1.parse(input2), expect2);
    });
    it("should parse ul", function () {
        var input = "- li1\n- li2\n- li3";
        var expect = "<ul><li>li1</li><li>li2</li><li>li3</li></ul>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse ol", function () {
        var input = "1. li1\n2. li2\n3. li3";
        var expect = "<ol><li>li1</li><li>li2</li><li>li3</li></ol>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse anchor", function () {
        var input = "[label](url)";
        var expect = "<p><a href=\"url\">label</a></p>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse code block", function () {
        var input = "```test\n\ncode\n\n```";
        var expect = "<pre><code>\ncode\n</code></pre>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse code inline", function () {
        var input = "this should be surrounded with `code`";
        var expect = "<p>this should be surrounded with <code>code</code></p>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse blockquote", function () {
        var input = "> this is the test of blockquote.\n> This should be treated as the same paragraph in the same quotation.";
        var expect = "<blockquote><p>this is the test of blockquote.<br />This should be treated as the same paragraph in the same quotation.</p></blockquote>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse nested blockquote", function () {
        var input = "> This is the test of blockquote.\n> > This is child.\n> This should be treated as the same paragraph in the same quotation.";
        var expect = "<blockquote><p>This is the test of blockquote.<br /><blockquote>This is child.</blockquote><br />This should be treated as the same paragraph in the same quotation.</p></blockquote>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse multiple blockquotes", function () {
        var input = "> para1\n\n> para2";
        var expect = "<blockquote><p>para1</p></blockquote><blockquote><p>para2</p></blockquote>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse mixed text", function () {
        var input = "# h1\n\n1. li\n2. li\n\n- li\n- li\n\n> para1\n> > para1\n\n> para2";
        var expect = "<h1>h1</h1><ol><li>li</li><li>li</li></ol><ul><li>li</li><li>li</li></ul><blockquote><p>para1<br /><blockquote>para1</blockquote></p></blockquote><blockquote><p>para2</p></blockquote>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse nested lists", function () {
        var input = "- test1\n- test2\n  - a";
        var expect = "<ul><li>test1</li><li>test2<ul><li>a</li></ul></li></ul>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse nested lists", function () {
        var input = "- test1\n- test2\n  - a\n- b";
        var expect = "<ul><li>test1</li><li>test2<ul><li>a</li></ul></li><li>b</li></ul>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse nested lists (complex one)", function () {
        var input = "- a\n- b\n  - c\n    - d\n  - e\n- f\n  1. g\n  2. h";
        var expect = "<ul><li>a</li><li>b<ul><li>c<ul><li>d</li></ul></li><li>e</li></ul></li><li>f<ol><li>g</li><li>h</li></ol></li></ul>";
        assert.equal(parser_1.parse(input), expect);
    });
    it("should parse nested lists (separated)", function () {
        var input = "- a\n- b\n  - c\n    - d\n  - e\n\n- f\n  1. g\n  2. h";
        var expect = "<ul><li>a</li><li>b<ul><li>c<ul><li>d</li></ul></li><li>e</li></ul></li></ul><ul><li>f<ol><li>g</li><li>h</li></ol></li></ul>";
        assert.equal(parser_1.parse(input), expect);
    });
});
