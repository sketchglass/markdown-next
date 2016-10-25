import * as assert from 'power-assert'

import {parse} from "../src/parser"

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
  })
  it('should parse em text a single phrase', () => {
    const input = `*em*`
    const expect = "<p><em>em</em></p>"
    assert.equal(parse(input), expect)
  })
  it('should parse complex text', () => {
    const input = `
# header1
paragraph`
    const expect = "<br /><h1>header1</h1><p>paragraph</p>"
    assert.equal(parse(input), expect)
    const input2 = `#Lorem Ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at urna diam. Ut vulputate ornare egestas. Vivamus fringilla molestie aliquam. Pellentesque elit dui, mollis nec augue vitae, lacinia iaculis dolor. Curabitur placerat tortor ut mauris consequat rhoncus. Sed nec nibh et diam dictum blandit. Morbi quis finibus nulla. Suspendisse sit amet tincidunt nisi. Morbi lacinia molestie purus eget dignissim. Maecenas pharetra elit tellus, ac congue dui finibus sit amet. Vivamus tempus at mauris vitae euismod. Cras lacus nulla, fermentum at varius vitae, varius ac elit. Nulla sit amet nibh in augue feugiat ultricies. Praesent eget mi imperdiet, dapibus augue sed, porttitor nulla. Nunc sed sodales ex. Nullam ut magna eget lectus luctus dapibus.

Integer odio augue, rhoncus non velit ac, ultricies ornare libero. Vivamus fermentum lectus nec diam accumsan, in sodales leo pulvinar. Quisque eu sapien mauris. Integer sagittis cursus massa id eleifend. Vestibulum dignissim eleifend felis, in laoreet neque egestas at. Etiam elementum vel mauris id iaculis. Duis blandit at sapien ac viverra. Proin ac erat a mauris dignissim semper quis vel libero. In id massa id nibh malesuada ornare non volutpat risus. Pellentesque sem nibh, vehicula a dolor quis, volutpat sagittis magna. Mauris ipsum arcu, tempus vel sollicitudin ac, consectetur sed magna. Praesent tempor varius justo vitae convallis. Nam pharetra, lacus quis ultrices vehicula, risus arcu porta libero, ac pretium ex elit in nisl. Integer urna ante, hendrerit sollicitudin convallis et, finibus nec odio.

Morbi viverra lacus tortor, eu consectetur ante tempor quis. Fusce eu eros et nisi volutpat efficitur. Proin euismod id eros ut eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed fermentum libero, ultrices commodo mi. Praesent auctor quis purus ut tristique. Mauris quis nunc nec augue congue dignissim eu et neque. Suspendisse potenti. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.`
    const expect2 = "<h1>Lorem Ipsum</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at urna diam. Ut vulputate ornare egestas. Vivamus fringilla molestie aliquam. Pellentesque elit dui, mollis nec augue vitae, lacinia iaculis dolor. Curabitur placerat tortor ut mauris consequat rhoncus. Sed nec nibh et diam dictum blandit. Morbi quis finibus nulla. Suspendisse sit amet tincidunt nisi. Morbi lacinia molestie purus eget dignissim. Maecenas pharetra elit tellus, ac congue dui finibus sit amet. Vivamus tempus at mauris vitae euismod. Cras lacus nulla, fermentum at varius vitae, varius ac elit. Nulla sit amet nibh in augue feugiat ultricies. Praesent eget mi imperdiet, dapibus augue sed, porttitor nulla. Nunc sed sodales ex. Nullam ut magna eget lectus luctus dapibus.</p><p>Integer odio augue, rhoncus non velit ac, ultricies ornare libero. Vivamus fermentum lectus nec diam accumsan, in sodales leo pulvinar. Quisque eu sapien mauris. Integer sagittis cursus massa id eleifend. Vestibulum dignissim eleifend felis, in laoreet neque egestas at. Etiam elementum vel mauris id iaculis. Duis blandit at sapien ac viverra. Proin ac erat a mauris dignissim semper quis vel libero. In id massa id nibh malesuada ornare non volutpat risus. Pellentesque sem nibh, vehicula a dolor quis, volutpat sagittis magna. Mauris ipsum arcu, tempus vel sollicitudin ac, consectetur sed magna. Praesent tempor varius justo vitae convallis. Nam pharetra, lacus quis ultrices vehicula, risus arcu porta libero, ac pretium ex elit in nisl. Integer urna ante, hendrerit sollicitudin convallis et, finibus nec odio.</p><p>Morbi viverra lacus tortor, eu consectetur ante tempor quis. Fusce eu eros et nisi volutpat efficitur. Proin euismod id eros ut eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed fermentum libero, ultrices commodo mi. Praesent auctor quis purus ut tristique. Mauris quis nunc nec augue congue dignissim eu et neque. Suspendisse potenti. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>"
  })
})
