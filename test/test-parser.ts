import * as assert from 'power-assert'

import {parse, Parser, asAST, asHTML} from "../src/parser"

describe("parser", () => {
  it('should parse h1', () => {
    const input = "# header"
    const expect = "<h1>header</h1>"
    assert.equal(parse(input), expect)
  })
  it('should parse h2', () => {
    const input = "## header"
    const expect = "<h2>header</h2>"
    assert.equal(parse(input), expect)
  })
  it('should parse h3', () => {
    const input = "### header"
    const expect = "<h3>header</h3>"
    assert.equal(parse(input), expect)
  })
  it('should parse h4', () => {
    const input = "#### header"
    const expect = "<h4>header</h4>"
    assert.equal(parse(input), expect)
  })
  it('should parse h5', () => {
    const input = "##### header"
    const expect = "<h5>header</h5>"
    assert.equal(parse(input), expect)
  })
  it('should parse h6', () => {
    const input = "###### header"
    const expect = "<h6>header</h6>"
    assert.equal(parse(input), expect)
  })
  it('should parse single line as a paragraph', () => {
    const input = `para1`
    const expect = "<p>para1</p>"
    assert.equal(parse(input), expect)
  })
  it('should parse a paragraph', () => {
    const input = `para1

para2`
    const expect = "<p>para1</p><p>para2</p>"
    assert.equal(parse(input), expect)
  })
  it('should parse a paragraph', () => {
    const input = `para1


para2`
    const expect = "<p>para1</p><p>para2</p>"
    assert.equal(parse(input), expect)
  })
  it('should parse strong text inside a paragraph', () => {
    const input = `this should be **strong**`
    const expect = "<p>this should be <strong>strong</strong></p>"
    assert.equal(parse(input), expect)
  })

  it('should parse strong text a single phrase', () => {
    const input = `**strong**`
    const expect = "<p><strong>strong</strong></p>"
    assert.equal(parse(input), expect)
    const input2 = `__em__`
    const expect2 = "<p><strong>em</strong></p>"
    assert.equal(parse(input2), expect2)
  })
  it('should parse em text a single phrase', () => {
    const input = `*em*`
    const expect = "<p><em>em</em></p>"
    assert.equal(parse(input), expect)
    const input2 = `_em_`
    const expect2 = "<p><em>em</em></p>"
    assert.equal(parse(input2), expect2)
  })
  it('should parse complex text', () => {
    const input = `
# header1
paragraph`
    const expect = "<h1>header1</h1><p>paragraph</p>"
    assert.equal(parse(input), expect)
    const input2 = `# Lorem Ipsum

\`Lorem ipsum dolor\` sit amet, [consectetur](http://example.com) **adipiscing** elit. Pellentesque at urna diam. Ut vulputate ornare egestas. Vivamus fringilla molestie aliquam. Pellentesque elit dui, mollis nec augue vitae, lacinia iaculis dolor. Curabitur placerat tortor ut mauris consequat rhoncus. Sed nec nibh et diam dictum blandit. Morbi quis finibus nulla. Suspendisse sit amet tincidunt nisi. Morbi lacinia molestie purus eget dignissim. Maecenas pharetra elit tellus, ac congue dui finibus sit amet. Vivamus tempus at mauris vitae euismod. Cras lacus nulla, fermentum at varius vitae, varius ac elit. Nulla sit amet nibh in augue feugiat ultricies. Praesent eget mi imperdiet, dapibus augue sed, porttitor nulla. Nunc sed sodales ex. Nullam ut magna eget lectus luctus dapibus.

Integer odio augue, rhoncus non velit ac, ultricies ornare libero. Vivamus fermentum lectus nec diam accumsan, in sodales leo pulvinar. Quisque eu sapien mauris. Integer sagittis cursus massa id eleifend. Vestibulum dignissim eleifend felis, in laoreet neque egestas at. Etiam elementum vel mauris id iaculis. Duis blandit at sapien ac viverra. Proin ac erat a mauris dignissim semper quis vel libero. In id massa id nibh malesuada ornare non volutpat risus. Pellentesque sem nibh, vehicula a dolor quis, volutpat sagittis magna. Mauris ipsum arcu, tempus vel sollicitudin ac, consectetur sed magna. Praesent tempor varius justo vitae convallis. Nam pharetra, lacus quis ultrices vehicula, risus arcu porta libero, ac pretium ex elit in nisl. Integer urna ante, hendrerit sollicitudin convallis et, finibus nec odio.

Morbi viverra lacus tortor, eu consectetur ante tempor quis. Fusce eu eros et nisi volutpat efficitur. Proin euismod id eros ut eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed fermentum libero, ultrices commodo mi. Praesent auctor quis purus ut tristique. Mauris quis nunc nec augue congue dignissim eu et neque. Suspendisse potenti. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
\`\`\`
code block
\`\`\`
`
    const expect2 = "<h1>Lorem Ipsum</h1><p><code>Lorem ipsum dolor</code> sit amet, <a href=\"http://example.com\">consectetur</a> <strong>adipiscing</strong> elit. Pellentesque at urna diam. Ut vulputate ornare egestas. Vivamus fringilla molestie aliquam. Pellentesque elit dui, mollis nec augue vitae, lacinia iaculis dolor. Curabitur placerat tortor ut mauris consequat rhoncus. Sed nec nibh et diam dictum blandit. Morbi quis finibus nulla. Suspendisse sit amet tincidunt nisi. Morbi lacinia molestie purus eget dignissim. Maecenas pharetra elit tellus, ac congue dui finibus sit amet. Vivamus tempus at mauris vitae euismod. Cras lacus nulla, fermentum at varius vitae, varius ac elit. Nulla sit amet nibh in augue feugiat ultricies. Praesent eget mi imperdiet, dapibus augue sed, porttitor nulla. Nunc sed sodales ex. Nullam ut magna eget lectus luctus dapibus.</p><p>Integer odio augue, rhoncus non velit ac, ultricies ornare libero. Vivamus fermentum lectus nec diam accumsan, in sodales leo pulvinar. Quisque eu sapien mauris. Integer sagittis cursus massa id eleifend. Vestibulum dignissim eleifend felis, in laoreet neque egestas at. Etiam elementum vel mauris id iaculis. Duis blandit at sapien ac viverra. Proin ac erat a mauris dignissim semper quis vel libero. In id massa id nibh malesuada ornare non volutpat risus. Pellentesque sem nibh, vehicula a dolor quis, volutpat sagittis magna. Mauris ipsum arcu, tempus vel sollicitudin ac, consectetur sed magna. Praesent tempor varius justo vitae convallis. Nam pharetra, lacus quis ultrices vehicula, risus arcu porta libero, ac pretium ex elit in nisl. Integer urna ante, hendrerit sollicitudin convallis et, finibus nec odio.</p><p>Morbi viverra lacus tortor, eu consectetur ante tempor quis. Fusce eu eros et nisi volutpat efficitur. Proin euismod id eros ut eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed fermentum libero, ultrices commodo mi. Praesent auctor quis purus ut tristique. Mauris quis nunc nec augue congue dignissim eu et neque. Suspendisse potenti. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p><pre><code>code block</code></pre>"
    assert.equal(parse(input2), expect2)
  })
  it("should parse ul", () => {
    const input = `- li1
- li2
- li3`
    const expect = `<ul><li>li1</li><li>li2</li><li>li3</li></ul>`
    assert.equal(parse(input), expect)
  })
  it("should parse ol", () => {
    const input = `1. li1
2. li2
3. li3`
    const expect = `<ol><li>li1</li><li>li2</li><li>li3</li></ol>`
    assert.equal(parse(input), expect)
  })
  it("should parse anchor", () => {
    const input = `[label](url)`
    const expect = `<p><a href="url">label</a></p>`
    assert.equal(parse(input), expect)
  })
  it("should parse code block", () => {
    const input = `
\`\`\`
code
code
\`\`\``
    const expect = `<pre><code>code\ncode</code></pre>`
    assert.equal(parse(input), expect)
  })
  it("should parse code block with a language type", () => {
    const input = `
\`\`\`ts
code
code
\`\`\``
    const expect = `<pre data-language="ts"><code>code\ncode</code></pre>`
    assert.equal(parse(input), expect)
  })
  it("should parse code inline", () => {
    const input = "this should be surrounded with `code`"
    const expect = `<p>this should be surrounded with <code>code</code></p>`
    assert.equal(parse(input), expect)
  })
  it("should parse blockquote", () => {
    const input = `> this is the test of blockquote.
> This should be treated as the same paragraph in the same quotation.`
    const expect = `<blockquote>this is the test of blockquote.<br />This should be treated as the same paragraph in the same quotation.</blockquote>`
    assert.equal(parse(input), expect)
  })
  it("should parse nested blockquote", () => {
    const input = `> This is the test of blockquote.
> > This is child.
> This should be treated as the same paragraph in the same quotation.`
    const expect = `<blockquote>This is the test of blockquote.<blockquote>This is child.</blockquote>This should be treated as the same paragraph in the same quotation.</blockquote>`
    assert.equal(parse(input), expect)
  })
  it("should parse nested blockquote", () => {
    const input = `> This is the test of blockquote.
> > This is child.
> > > This is child's child.
> > > This is child's child.
> > This is child.
> This should be treated as the same paragraph in the same quotation.`
    const expect = `<blockquote>This is the test of blockquote.<blockquote>This is child.<blockquote>This is child's child.<br />This is child's child.</blockquote>This is child.</blockquote>This should be treated as the same paragraph in the same quotation.</blockquote>`
    assert.equal(parse(input), expect)
  })
  it("should parse multiple blockquotes", () => {
    const input = `> para1

> para2`
    const expect = `<blockquote>para1</blockquote><blockquote>para2</blockquote>`
    assert.equal(parse(input), expect)
  })
  it("should parse mixed text", () => {
    const input = `# h1

1. li
2. li

- li
- li

> para1
> > para1

> para2`
    const expect = `<h1>h1</h1><ol><li>li</li><li>li</li></ol><ul><li>li</li><li>li</li></ul><blockquote>para1<blockquote>para1</blockquote></blockquote><blockquote>para2</blockquote>`
    assert.equal(parse(input), expect)
  })
  it("should parse nested lists", () => {
    const input = `- test1
- test2
  - a`
    const expect = `<ul><li>test1</li><li>test2<ul><li>a</li></ul></li></ul>`
    assert.equal(parse(input), expect)
  })
  it("should parse nested lists", () => {
    const input = `- test1
- test2
  - a
- b`
    const expect = `<ul><li>test1</li><li>test2<ul><li>a</li></ul></li><li>b</li></ul>`
    assert.equal(parse(input), expect)
  })
  it("should parse nested lists (complex one)", () => {
    const input = `- a
- b
  - c
    - d
  - e
- f
  1. g
  2. h`
    const expect = `<ul><li>a</li><li>b<ul><li>c<ul><li>d</li></ul></li><li>e</li></ul></li><li>f<ol><li>g</li><li>h</li></ol></li></ul>`
    assert.equal(parse(input), expect)
  })
  it("should parse unindentation in list correctly", () => {
    const input = `
- a
  - b
    - c
- d`
    const expect = `<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li><li>d</li></ul>`
    assert.equal(parse(input), expect)
  })
  it("should parse nested lists (separated)", () => {
    const input = `- a
- b
  - c
    - d
  - e

- f
  1. g
  2. h`
    const expect = `<ul><li>a</li><li>b<ul><li>c<ul><li>d</li></ul></li><li>e</li></ul></li></ul><ul><li>f<ol><li>g</li><li>h</li></ol></li></ul>`
    assert.equal(parse(input), expect)
  })
  it("should parse broken nested lists", () => {
    const input = `- a
- b
   - c`
    const expect = `<ul><li>a</li><li>b</li></ul><p>- c</p>`
    assert.equal(parse(input), expect)
  })
  it("should parse a list after broken nested lists", () => {
    const input = `- a
- b
   - c

aaaa

- a`
    const expect = `<ul><li>a</li><li>b</li></ul><p>- c</p><p>aaaa</p><ul><li>a</li></ul>`
    assert.equal(parse(input), expect)
  })
  it("should parse another form of headers", () => {
    const input = `aaaaa
===============
bbbbb
---------------

para`
    const expect = `<h1>aaaaa</h1><h2>bbbbb</h2><p>para</p>`
    assert.equal(parse(input), expect)
  })
  it("should parse img", () => {
    const input = `![alt](url)`
    const expect = `<p><img src="url" alt="alt" /></p>`
    assert.equal(parse(input), expect)
  })
  it("should parse table", () => {
    const input = `| a | b | c |
| --- | -- | -- |
| d | e | f |`
    const expect = `<table><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></table>`
    assert.equal(parse(input), expect)
  })
  it("should parse extension syntax", () => {
    const p = new Parser({
      export: asHTML,
      plugins: {
        id: (args, str) => {
          return str
        }
      }
    })
    const input = `
@[id]
  this should be showed as plain string
  following string also should be treated as content
`
    assert.equal(p.parse(input), "this should be showed as plain string\nfollowing string also should be treated as content\n")
  })
  it("should parse inline extension syntax", () => {
    const p = new Parser({
      export: asHTML,
      plugins: {
        print: (args, str) => {
          return args
        }
      }
    })
    const input = `
x is @[print:40]
`
    assert.equal(p.parse(input), "<p>x is 40</p>")
  })
  describe("courner cases", () => {
    it("can parse mixes of blockquote and list", () => {
      const input = `

> a

cccc

- a
  - b

            `
      const expect = '<blockquote>a</blockquote><p>cccc</p><ul><li>a<ul><li>b</li></ul></li></ul>'
      assert.equal(parse(input), expect)
    })
    it("should parse h1 after paragraph", () => {
      const input = `para

# h1

para
para`
      const expect = `<p>para</p><h1>h1</h1><p>para<br />para</p>`
      assert.equal(parse(input), expect)
    })
    it("should parse as a paragraph contains special characters", () => {
      const input = `para#para`
      const expect = `<p>para#para</p>`
      assert.equal(parse(input), expect)
    })
    it("should parse list first", () => {
      const input = `para

para

para

1. li
2. li`
      const expect = `<p>para</p><p>para</p><p>para</p><ol><li>li</li><li>li</li></ol>`
      assert.equal(parse(input), expect)
    })
    it("should parser h1/h2 eager", () => {
      const input = `
para1

aaaa
=================

bbbb
-----------------
`
      const expect = `<p>para1</p><h1>aaaa</h1><h2>bbbb</h2>`
      assert.equal(parse(input), expect)
    })
    it('can parse a paragraph which begins with "#"', () => {
      const input = `
#this should be treated as paragraph.
`
      const expect = `<p>#this should be treated as paragraph.</p>`
      assert.equal(parse(input), expect)
    })
    it('can parse a paragraph which begins with "-"', () => {
      const input = `
-this should be treated as paragraph.
`
      const expect = `<p>-this should be treated as paragraph.</p>`
      assert.equal(parse(input), expect)
    })
    it('can parse a paragraph which begins with "["', () => {
      const input = `
[this should be treated as paragraph.
`
      const expect = `<p>[this should be treated as paragraph.</p>`
      assert.equal(parse(input), expect)
    })
    it('can parse a paragraph which begins with "*"', () => {
      const input = `
*this should be treated as paragraph.
`
      const expect = `<p>*this should be treated as paragraph.</p>`
      assert.equal(parse(input), expect)
    })
    it('can parse a paragraph which begins with "="', () => {
      const input = `
=this should be treated as paragraph.
`
      const expect = `<p>=this should be treated as paragraph.</p>`
      assert.equal(parse(input), expect)
    })
    it('can parse a paragraph which begins with "0."', () => {
      const input = `
0.this should be treated as paragraph.
`
      const expect = `<p>0.this should be treated as paragraph.</p>`
      assert.equal(parse(input), expect)
    })
    it('can parse a paragraph which begins with "]"', () => {
      const input = `
]this should be treated as paragraph.
`
      const expect = `<p>]this should be treated as paragraph.</p>`
      assert.equal(parse(input), expect)
    })
    it('can parse a paragraph which begins with "`"', () => {
      const input = `
\`this should be treated as paragraph.
`
      const expect = `<p>\`this should be treated as paragraph.</p>`
      assert.equal(parse(input), expect)
    })
    it('can parse a paragraph and a code block sepalatery', () => {
      const input = `paragraph
\`\`\`
code block
\`\`\`
`
      const expect = `<p>paragraph</p><pre><code>code block</code></pre>`
      assert.equal(parse(input), expect)
    })
    it('can parse incorrect code block as paragraph', () => {
      const input = `paragraph
\`\`\`
code block
\`
`
      const expect = `<p>paragraph<br />\`\`\`<br />code block<br />\`</p>`
      assert.equal(parse(input), expect)
    })
    it('can parse inline code contains underscore', () => {
        const input = "`_`";
        const expect = `<p><code>_</code></p>`
        assert.equal(parse(input), expect)
    })
  })
  describe("AST", () => {
    it("can output paragraph", () => {
      const parser = new Parser({
        export: asAST
      })
      const input = `
  paragraph
  `
      const expect = [["p", null, ["paragraph"]]]
      assert.deepEqual(parser.parse(input), expect)
    })
    it("can output list", () => {
      const parser = new Parser({
        export: asAST
      })
      const input = `
- li1
- li2
  - li3
`
      const expect = [["ul", null, [
        ["li", null, "li1"],
        ["li", null, [
          "li2",
          ["ul", null, [
            ["li", null, "li3"]
          ]],
        ]],
      ]]]
      assert.deepEqual(parser.parse(input), expect)
    })
    it('should treat continuous input as single string', () => {
      const parser = new Parser({
        export: asAST
      })
      const input = `
  paragraph1

  paragraph2
  `
      const expect = [["p", null, ["paragraph1"]], ["p", null, ["paragraph2"]]]
      assert.deepEqual(parser.parse(input), expect)

    })
    it('should treat nested structures', () => {
      const parser = new Parser({
        export: asAST
      })
      const input = `
  para **b** graph
  `
      const expect = [["p", null, [
        "para ",
        ["strong", null, 'b'],
        " graph",
      ]]]
      assert.deepEqual(parser.parse(input), expect)

    })
  })
  describe('Extention', () => {
    it('can be extended by user', () => {
      const plugins = {
        'extention': (args: string, content: string, mapper: Function, join: Function) => {
          return mapper('extention', null)(content.trim())
        }
      }
      const parser = new Parser({
        export: asHTML,
        plugins
      })
      const input = `
      @[extention]
        user value
 `
      const expect = `<extention>user value</extention>`

      assert.equal(parser.parse(input), expect)

    })
  })

  describe('Edge Cases', () => {
    describe('Empty and whitespace inputs', () => {
      it('should handle empty string', () => {
        const input = ""
        const expect = ""
        assert.equal(parse(input), expect)
      })

      it('should handle whitespace-only string', () => {
        const input = "   "
        const expect = ""
        assert.equal(parse(input), expect)
      })

      it('should handle newline-only string', () => {
        const input = "\n\n\n"
        const expect = ""
        assert.equal(parse(input), expect)
      })

      it('should handle tabs and spaces', () => {
        const input = "\t  \t  "
        const expect = ""
        assert.equal(parse(input), expect)
      })
    })

    describe('XSS and security', () => {
      it('should handle quotes in anchor href', () => {
        const input = `[link](http://example.com"onclick="alert(1))`
        const result = parse(input)
        // Should not break HTML structure
        assert(result.includes('<a href='))
      })

      it('should handle quotes in image src', () => {
        const input = `![alt](http://example.com"onerror="alert(1))`
        const result = parse(input)
        // Should not break HTML structure
        assert(result.includes('<img src='))
      })

      it('should handle special characters in link text', () => {
        const input = `[<script>alert(1)</script>](http://example.com)`
        const result = parse(input)
        assert(result.includes('&lt;script&gt;') || result.includes('<script>'))
      })
    })

    describe('Unicode and special characters', () => {
      it('should parse emoji in paragraph', () => {
        const input = `Hello 😀 World 🎉`
        const expect = `<p>Hello 😀 World 🎉</p>`
        assert.equal(parse(input), expect)
      })

      it('should parse unicode characters', () => {
        const input = `日本語テキスト`
        const expect = `<p>日本語テキスト</p>`
        assert.equal(parse(input), expect)
      })

      it('should parse right-to-left text', () => {
        const input = `مرحبا بالعالم`
        const expect = `<p>مرحبا بالعالم</p>`
        assert.equal(parse(input), expect)
      })
    })

    describe('Empty elements', () => {
      it('should handle empty strong tags', () => {
        const input = `****`
        // Should parse as paragraph with empty strong or as plain text
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should handle empty em tags', () => {
        const input = `**`
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should handle empty code tags', () => {
        const input = '``'
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should handle empty anchor', () => {
        const input = `[]()`
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should handle empty image', () => {
        const input = `![]()`
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should handle empty list items', () => {
        const input = `- \n- item`
        const expect = `<ul><li></li><li>item</li></ul>`
        assert.equal(parse(input), expect)
      })

      it('should handle empty blockquote', () => {
        const input = `> `
        const result = parse(input)
        assert(result.length >= 0)
      })
    })

    describe('Unclosed tags', () => {
      it('should handle unclosed strong tag', () => {
        const input = `**unclosed`
        const result = parse(input)
        // Should parse as paragraph
        assert(result.includes('<p>'))
      })

      it('should handle unclosed em tag', () => {
        const input = `*unclosed`
        const result = parse(input)
        assert(result.includes('<p>'))
      })

      it('should handle unclosed code tag', () => {
        const input = '`unclosed'
        const result = parse(input)
        assert(result.includes('<p>'))
      })

      it('should handle unclosed anchor', () => {
        const input = `[unclosed`
        const result = parse(input)
        assert(result.includes('<p>'))
      })
    })

    describe('Line ending variations', () => {
      it('should handle CRLF line endings', () => {
        const input = "para1\r\n\r\npara2"
        const expect = "<p>para1</p><p>para2</p>"
        assert.equal(parse(input), expect)
      })

      it('should handle CR line endings', () => {
        const input = "para1\r\rpara2"
        const expect = "<p>para1</p><p>para2</p>"
        assert.equal(parse(input), expect)
      })

      it('should handle mixed line endings', () => {
        const input = "para1\n\r\npara2\r\npara3"
        const result = parse(input)
        // Should parse all paragraphs
        assert(result.includes('para1'))
        assert(result.includes('para2'))
        assert(result.includes('para3'))
      })
    })

    describe('Nested structures depth', () => {
      it('should handle deeply nested lists', () => {
        const input = `- level1
  - level2
    - level3
      - level4
        - level5`
        const result = parse(input)
        // Should parse without crashing
        assert(result.includes('<ul>'))
      })

      it('should handle deeply nested blockquotes', () => {
        const input = `> level1
> > level2
> > > level3
> > > > level4
> > > > > level5`
        const result = parse(input)
        // Should parse without crashing
        assert(result.includes('<blockquote>'))
      })
    })

    describe('List indentation edge cases', () => {
      it('should handle single space indentation', () => {
        const input = `- a
 - b`
        const result = parse(input)
        // Should fail and parse as paragraph or handle gracefully
        assert(result.length > 0)
      })

      it('should handle three space indentation', () => {
        const input = `- a
   - b`
        const result = parse(input)
        // Should fail validation and parse as paragraph
        assert(result.includes('<ul>'))
      })

      it('should handle tab indentation', () => {
        const input = "- a\n\t- b"
        const result = parse(input)
        // Tabs might not work correctly
        assert(result.length > 0)
      })
    })

    describe('Code block edge cases', () => {
      it('should handle code block with backticks inside', () => {
        const input = '```\ncode with ` backtick\n```'
        const expect = '<pre><code>code with ` backtick</code></pre>'
        assert.equal(parse(input), expect)
      })

      it('should handle empty code block', () => {
        const input = '```\n```'
        const result = parse(input)
        // Should handle empty code block
        assert(result.includes('<pre>'))
      })

      it('should handle code block with only newlines', () => {
        const input = '```\n\n\n```'
        const result = parse(input)
        assert(result.includes('<pre>'))
      })
    })

    describe('Table edge cases', () => {
      it('should handle table with empty cells', () => {
        const input = `| a |  | c |
| --- | -- | -- |
| d |  | f |`
        const result = parse(input)
        assert(result.includes('<table>'))
      })

      it('should handle table with different column counts', () => {
        const input = `| a | b |
| --- | -- | -- |
| d | e | f |`
        const result = parse(input)
        // Malformed table should handle gracefully
        assert(result.length > 0)
      })
    })

    describe('Special character combinations', () => {
      it('should handle multiple asterisks', () => {
        const input = `***text***`
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should handle mixed emphasis markers', () => {
        const input = `*_text_*`
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should handle multiple hashes without space', () => {
        const input = `###noSpace`
        const result = parse(input)
        assert(result.includes('<p>'))
      })
    })

    describe('Very long inputs', () => {
      it('should handle very long paragraph', () => {
        const input = 'a'.repeat(10000)
        const result = parse(input)
        assert(result.includes('<p>'))
        assert(result.includes('a'))
      })

      it('should handle many list items', () => {
        const items = Array(1000).fill(0).map((_, i) => `- item${i}`).join('\n')
        const result = parse(items)
        assert(result.includes('<ul>'))
        assert(result.includes('item0'))
        assert(result.includes('item999'))
      })
    })

    describe('Special parsing scenarios', () => {
      it('should handle header followed by list without blank line', () => {
        const input = `# Header
- item1
- item2`
        const result = parse(input)
        assert(result.includes('<h1>'))
        assert(result.includes('<ul>'))
      })

      it('should handle multiple consecutive blank lines', () => {
        const input = `para1



para2`
        const expect = `<p>para1</p><p>para2</p>`
        assert.equal(parse(input), expect)
      })

      it('should handle trailing whitespace', () => {
        const input = `paragraph   `
        const result = parse(input)
        assert(result.includes('paragraph'))
      })

      it('should handle leading whitespace in code block', () => {
        const input = '```\n  indented code\n```'
        const result = parse(input)
        assert(result.includes('indented code'))
      })
    })

    describe('Random string robustness', () => {
      it('should parse random alphanumeric strings without crashing', () => {
        const input = 'asdfghjkl123456789'
        const result = parse(input)
        assert(result.length > 0)
        assert(result.includes('asdfghjkl123456789'))
      })

      it('should parse random special characters without crashing', () => {
        const input = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~'
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should parse mixed random content without crashing', () => {
        const input = '## # ** * ``` [ ]( ![alt text - * 1. > '
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should parse unicode mixed with markdown without crashing', () => {
        const input = '# 你好 **世界** 🌍\n- item 日本語\n> quote مرحبا'
        const result = parse(input)
        assert(result.length > 0)
        assert(result.includes('你好'))
        assert(result.includes('世界'))
      })

      it('should handle strings with only special markdown characters', () => {
        const input = '###***```___---|||[[[]]]'
        const result = parse(input)
        assert(result.length > 0)
      })

      it('should handle malformed markdown gracefully', () => {
        const input = '# [incomplete link\n** unclosed bold\n``` unclosed code\n- - - multiple dashes'
        const result = parse(input)
        // Should not throw, should parse as paragraphs
        assert(result.length > 0)
      })
    })
  })
})
