import * as P from "parsimmon"

const whitespace = P.regexp(/\s+/m)
const asterisk = P.string("*")
const sharp = P.string("#")
const plainStr = P.regexp(/[^`\*\r\n]+/)
const linebreak = P.string("\r\n").or(P.string("\n")).or(P.string("\r"))

const surroundWith = (tag: string) => {
  return (s: string) => {
    return `<${tag}>${s}</${tag}>`
  }
}
const token = (p: P.Parser<any>) => {
  return p.skip(P.regexp(/\s*/m))
}
const h1 = token(P.seq(
    sharp,
    whitespace,
  ).then(plainStr)).map(surroundWith("h1"))
const h2 = token(P.seq(
    sharp.times(2),
    whitespace,
  ).then(plainStr)).map(surroundWith("h2"))
const h3 = token(P.seq(
    sharp.times(3),
    whitespace,
  ).then(plainStr)).map(surroundWith("h3"))
const h4 = token(P.seq(
    sharp.times(4),
    whitespace,
  ).then(plainStr)).map(surroundWith("h4"))
const h5 = token(P.seq(
    sharp.times(5),
    whitespace,
  ).then(plainStr)).map(surroundWith("h5"))
const h6 = token(P.seq(
    sharp.times(6),
    whitespace,
  ).then(plainStr)).map(surroundWith("h6"))

const strongStart = P.string("**")
const strongEnd = strongStart
const strong = strongStart
  .then(plainStr)
  .map(surroundWith("strong"))
  .skip(strongEnd)

const emStart = P.string("*")
const emEnd = emStart
const em = emStart
  .then(plainStr)
  .map(surroundWith("em"))
  .skip(emEnd)

const anchor = P.seqMap(
  P.string("["),
  P.regexp(/[^\]\r\n]+/),
  P.string("]("),
  P.regexp(/[^\)\r\n]+/),
  P.string(")"),
  (_1, label, _2, target, _3) => {
    return `<a href="${target}">${label}</a>`
  })

const codeStart = P.string("`")
const codeEnd = P.string("`")
const code = codeStart
  .then(plainStr)
  .map(surroundWith("code"))
  .skip(codeEnd)

const paragraphStr = P.regexp(/[^\r\n\[\]\*`]+/)
const inline = P.alt(
    anchor,
    em,
    strong,
    code,
    paragraphStr
  )

const paragraph = inline.atLeast(1).map(x => x.join("")).map(surroundWith("p"))

const paragraphStart = P.regexp(/^(?!(#|```))/)
const paragraphBreak =  linebreak.atLeast(2).result("")

const paragraphOrLinebreak = paragraph
  .or(paragraphBreak)
  .atLeast(1)
  .map(x => x.join(""))

const ul = P.string("- ").then(plainStr).skip(linebreak.many()).atLeast(1)
  .map(x => surroundWith("ul")(x.map(surroundWith("li")).join("")))
const ol = P.regexp(/[0-9]+\. /).then(plainStr).skip(linebreak.many()).atLeast(1)
  .map(x => surroundWith("ol")(x.map(surroundWith("li")).join("")))

const lists = ul.or(ol)

const codeBlockBegin = linebreak.atMost(1).then(P.string("```"))
const codeBlockEnd = P.string("```").skip(linebreak.atMost(1))
const codeBlockDefinitionStr = P.regexp(/[^`\r\n]*/)
const codeBlockStr = P.regexp(/[^`\r\n]+/)
const codeBlock = P.seqMap(
    codeBlockBegin,
    codeBlockDefinitionStr,
    linebreak,
    linebreak.or(codeBlockStr.skip(linebreak)).many(),
    codeBlockEnd,
    (_1, definition, _2, code, _3) => {
      return `<pre><code>${code.join("")}</code></pre>`
    })

const acceptables = P.alt(
    h6,
    h5,
    h4,
    h3,
    h2,
    h1,
    lists,
    codeBlock,
    paragraphOrLinebreak,
    linebreak.result("<br />"),
  ).many().map(x => x.join(""))

export const parse = (s: string) => {
  const parsed = acceptables.parse(s)
  if(parsed.hasOwnProperty("value"))
    return parsed.value
  console.error(parsed)
  throw new Error("Parsing was failed.")
}
