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
  })
})
