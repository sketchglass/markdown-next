import * as assert from 'power-assert'

import {parse, Parser, asAST} from "../src/parser"

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
    const input = "```test\n\ncode\n\n```"
    const expect = `<pre><code>\ncode\n</code></pre>`
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
    const expect = `<blockquote><p>this is the test of blockquote.<br />This should be treated as the same paragraph in the same quotation.</p></blockquote>`
    assert.equal(parse(input), expect)
  })
  it("should parse nested blockquote", () => {
    const input = `> This is the test of blockquote.
> > This is child.
> This should be treated as the same paragraph in the same quotation.`
    const expect = `<blockquote><p>This is the test of blockquote.<br /><blockquote>This is child.</blockquote><br />This should be treated as the same paragraph in the same quotation.</p></blockquote>`
    assert.equal(parse(input), expect)
  })
  it("should parse multiple blockquotes", () => {
    const input = `> para1

> para2`
    const expect = `<blockquote><p>para1</p></blockquote><blockquote><p>para2</p></blockquote>`
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
    const expect = `<h1>h1</h1><ol><li>li</li><li>li</li></ol><ul><li>li</li><li>li</li></ul><blockquote><p>para1<br /><blockquote>para1</blockquote></p></blockquote><blockquote><p>para2</p></blockquote>`
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
  describe("courner cases", () => {
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
  })
  describe("AST", () => {
    it("can output paragraph", () => {
      const parser = new Parser({
        type: asAST
      })
      const input = `
  paragraph
  `
      const expect = [["p", null, ["paragraph"]]]
      assert.deepEqual(parser.parse(input), expect)
    })
    it("can output list", () => {
      const parser = new Parser({
        type: asAST
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
  })
})
