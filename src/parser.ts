import * as P from "parsimmon"

interface IndexType {
  offset: number
  line: number
  column: number
}

interface ListTree {
  type: "ul" | "ol" | "shadow"
  children: Array<ListTree>
  value: string | null
  parent: ListTree | null
}

const whitespace = P.regexp(/\s+/m)
const asterisk = P.string("*")
const sharp = P.string("#")
const plainStr = P.regexp(/[^`_\*\r\n]+/)
const linebreak = P.string("\r\n").or(P.string("\n")).or(P.string("\r"))
const equal = P.string("=")
const minus = P.string("-")

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
  ).then(plainStr).or(plainStr.skip(P.seq(linebreak, equal.atLeast(1), linebreak)))).map(surroundWith("h1"))
const h2 = token(P.seq(
    sharp.times(2),
    whitespace,
  ).then(plainStr).or(plainStr.skip(P.seq(linebreak, minus.atLeast(1), linebreak)))).map(surroundWith("h2"))
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

const strongStart = P.string("**").or(P.string("__"))
const strongEnd = strongStart
const strong = strongStart
  .then(plainStr)
  .map(surroundWith("strong"))
  .skip(strongEnd)

const emStart = P.string("*").or(P.string("_"))
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

const img = P.seqMap(
  P.string("!["),
  P.regexp(/[^\]\r\n]+/),
  P.string("]("),
  P.regexp(/[^\)\r\n]+/),
  P.string(")"),
  (_1, alt, _2, url, _3) => {
    return `<img src="${url}" alt="${alt}" />`
  })

const codeStart = P.string("`")
const codeEnd = P.string("`")
const code = codeStart
  .then(plainStr)
  .map(surroundWith("code"))
  .skip(codeEnd)

const paragraphStr = P.regexp(/(?![0-9]. )^[^\r\n\[\]\*\#\-`][^\r\n\[\]\*`]*/)
const inline = P.alt(
    anchor,
    img,
    em,
    strong,
    code,
    paragraphStr,
  )
const tdStr = P.regexp(/[^\r\n\[\]\*|`]+(?= \|)/)
const tableInline = tdStr
const tableStart = P.string("| ")
const tableEnd = P.string(" |")
const tableSep = P.string(" | ")
const tableInner = P.seqMap(tableInline.skip(tableSep).atLeast(1), tableInline, (a, b) => { return [...a, b] })
const tableInnerOnlyHeader = P.seqMap(P.regexp(/-+/).skip(tableSep).atLeast(1), P.regexp(/-+/), (a, b) => { return [...a, b] })
const tableHeader = tableStart.then(tableInner).skip(tableEnd).skip(linebreak)
const tableHSep = tableStart.then(tableInnerOnlyHeader).skip(tableEnd).skip(linebreak)
const tableBody = tableStart.then(tableInner).skip(tableEnd.then(linebreak.atMost(1)))
const table = P.seqMap(
  tableHeader,
  tableHSep,
  tableBody.atLeast(1),
  (headers, _1, bodies) => {
    let res = "<table><tr>"
    for (const h of headers) res += "<th>" + h + "</th>"
    res += "</tr>"
    for (const b of bodies) {
      res += "<tr>"
      for (const x of b) res += "<td>" + x + "</td>"
      res += "</tr>"
    }
    res += "</table>"
    return res
  }
)

const paragraphLine = inline.atLeast(1).map(x => x.join(""))
const paragraph = P.seq(paragraphLine, linebreak.result("<br />"), paragraphLine).map(x => x.join("")).or(paragraphLine).map(surroundWith("p"))
const paragraphBreak =  linebreak.atLeast(2).result("")

const paragraphOrLinebreak = P.seq(paragraph, paragraphBreak, paragraph).map(x => x.join(""))
  .or(paragraph)
  .atLeast(1)
  .map(x => x.join(""))

const listIndent = P.string("  ")
const liSingleLine = plainStr

const ulStart = P.string("- ").or(P.string("* "))
const olStart =  P.regexp(/[0-9]+\. /)


let liLevel: number | null = null
let liLevelBefore: number | null = null

let rootTree: ListTree
let currentTree: ListTree
let nodeType: "ul" | "ol"

const listLineContent = P.seqMap(
  P.seqMap(
    listIndent.many(),
    P.index,
    (_1, index) => {
      const _index = index as any as IndexType
      if(liLevelBefore === null)
        liLevelBefore = liLevel = _index.column
      liLevelBefore = liLevel
      liLevel = _index.column
    }
  ),
  ulStart.or(olStart),
  (_1, start) => {
    // detect which types of content
    nodeType = ((start == "* ") || (start == "- ")) ? "ul" : "ol"
  }
).then(liSingleLine).skip(linebreak.atMost(1)).map(x => {
  if(liLevelBefore == liLevel) {
    currentTree.children.push({
      value: x,
      children: [],
      type: nodeType,
      parent: currentTree
    })
  } else if(liLevelBefore < liLevel) {
    const currentTreeIndex = currentTree.children.length - 1
    currentTree = currentTree.children[currentTreeIndex]
    currentTree.children.push({
      children: [],
      type: nodeType,
      parent: currentTree,
      value: x
    })
  } else if(liLevelBefore > liLevel) {
    if(currentTree.parent !== null) {
      currentTree = currentTree.parent
    }
    currentTree.children.push({
      type: nodeType,
      children: [],
      parent: currentTree,
      value: x
    })
  }
  const _nodeType = nodeType
  return _nodeType
})
const lists = listLineContent.atLeast(1).skip(linebreak.atMost(1)).map(nodeTypes => {
  rootTree.type = nodeTypes[0]
  const result = treeToHtml(rootTree)
  rootTree = currentTree = {
    value: null,
    children: [],
    type: "shadow",
    parent: null
  }
  return result
})


const treeToHtml = (treeOrNode: ListTree) => {
  if(treeOrNode.type === "shadow") {
    return treeOrNode.children.map(treeToHtml).join("")
  } else if(treeOrNode.children.length === 0 && treeOrNode.value !== null) {
    return "<li>" + treeOrNode.value + "</li>"
  } else if(treeOrNode.children.length !== 0 && treeOrNode.value !== null) {
    const {children} = treeOrNode
    const before = `<${treeOrNode.children[0].type}>`
    const after = `</${treeOrNode.children[0].type}>`
    return "<li>" + treeOrNode.value + before + children.map(treeToHtml).join("") + after + "</li>"
  } else {
    const before = `<${treeOrNode.type}>`
    const after = `</${treeOrNode.type}>`
    const {children} = treeOrNode
    return before + children.map(treeToHtml).join("") + after
  }
}

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

const blockquoteStr = P.regexp(/[^\r\n]+/)
const blockquoteBegin = P.string("> ")
let blockquoteLevel: number | null = null
let createBlockquote = false

const blockquoteLine = P.lazy(() => {
  return P.seqMap(
    P.seqMap(
      blockquoteBegin.atLeast(1),
      P.index,
      (_1, index) => {
        const _index = index as any as IndexType
        if (blockquoteLevel === null) {
          blockquoteLevel = _index.column
          return
        }
        if (blockquoteLevel < _index.column) {
          createBlockquote = true
        } else {
          createBlockquote = false
        }
        blockquoteLevel = _index.column
      }
    ),
    blockquoteStr,
    linebreak.atMost(1),
    (_1, s, _2) => {
      if (createBlockquote)
        return surroundWith("blockquote")(s)
      return s
    }
  )
})
const blockquote = P.lazy(() => {
  blockquoteLevel = null
  createBlockquote = false
  return blockquoteLine.atLeast(1).map(x => x.join("<br />")).map(surroundWith("p")).map(surroundWith("blockquote")).skip(whitespace.many())
})
const acceptables = P.alt(
    h6,
    h5,
    h4,
    h3,
    h2,
    h1,
    table,
    lists,
    codeBlock,
    blockquote,
    paragraphOrLinebreak,
    linebreak.result(""),
  ).many().map(x => x.join(""))

export const parse = (s: string) => {
  liLevelBefore = liLevel = null
  rootTree = currentTree = {
    value: null,
    children: [],
    type: "shadow",
    parent: null
  }
  const parsed = acceptables.parse(s)
  if(parsed.hasOwnProperty("value"))
    return parsed.value
  console.error(parsed)
  throw new Error("Parsing was failed.")
}
