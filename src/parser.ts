import P = require("parsimmon")
import * as util  from "util"

interface IndexType {
  offset: number
  line: number
  column: number
}

export
interface ListTree {
  type: "ul" | "ol" | "shadow"
  children: Array<ListTree>
  value: string | null
  parent: ListTree | null
}

export
type Plugin<T> = (args: string, content: any, mapper: Mapper<T>, join: Function) => string

export
type Mapper<T> = (tagName: string, attributes?: any) => (children: string | T | null) => T

export
interface ExportType<T> {
  mapper: Mapper<T>
  join:  Function
  postprocess: (x: any) => any
}

export
class Parser<T> {
  liLevelBefore: number | null = null
  liLevel: number | null = null
  rootTree: ListTree = {
    value: null,
    children: [],
    type: "shadow",
    parent: null
  }
  currentTree: ListTree = {
    value: null,
    children: [],
    type: "shadow",
    parent: null
  }
  acceptables: P.Parser<T>
  constructor(public opts: {
    export: ExportType<T>
    plugins?: {[pluginName: string]: Plugin<T>}
  }) {
    this.create()
  }
  create() {
    function flags(re) {
      var s = '' + re;
      return s.slice(s.lastIndexOf('/') + 1);
    }

    function ignore(re, group=0) {
      const {makeSuccess, makeFailure} = P as any

      const anchored = RegExp('^(?:' + re.source + ')', flags(re));
      const expected = '' + re;
      return (P as any)(function(input, i) {
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

    const whitespace = P.regexp(/\s+/m)
    const asterisk = P.string("*")
    const sharp = P.string("#")
    const plainStr = P.regexp(/[^`_\*\r\n]+/)
    const linebreak = P.string("\r\n").or(P.string("\n")).or(P.string("\r"))
    const equal = P.string("=")
    const minus = P.string("-")


    const join:any = this.opts.export.join
    const mapper = this.opts.export.mapper
    const token = (p: P.Parser<any>) => {
      return p.skip(P.regexp(/\s*/m))
    }
    const h1Special = P.regexp(/^(.*)\n\=+/, 1)
      .skip(P.alt(
        P.eof,
        P.string("\n")
      ))
      .map(mapper("h1"))
    const h2Special = P.regexp(/^(.*)\n\-+/, 1)
      .skip(P.alt(
        P.eof,
        P.string("\n")
      ))
      .map(mapper("h2"))
    const h1 = token(P.seq(
        sharp,
        whitespace,
      ).then(plainStr)).map(mapper("h1"))
    const h2 = token(P.seq(
        sharp.times(2),
        whitespace,
      ).then(plainStr)).map(mapper("h2"))
    const h3 = token(P.seq(
        sharp.times(3),
        whitespace,
      ).then(plainStr)).map(mapper("h3"))
    const h4 = token(P.seq(
        sharp.times(4),
        whitespace,
      ).then(plainStr)).map(mapper("h4"))
    const h5 = token(P.seq(
        sharp.times(5),
        whitespace,
      ).then(plainStr)).map(mapper("h5"))
    const h6 = token(P.seq(
        sharp.times(6),
        whitespace,
      ).then(plainStr)).map(mapper("h6"))

    const strongStart = P.string("**").or(P.string("__"))
    const strongEnd = strongStart
    const strong = strongStart
      .then(plainStr)
      .map(mapper("strong"))
      .skip(strongEnd)

    const emStart = P.string("*").or(P.string("_"))
    const emEnd = emStart
    const em = emStart
      .then(plainStr)
      .map(mapper("em"))
      .skip(emEnd)

    const anchor = P.seqMap(
      P.string("["),
      P.regexp(/[^\]\r\n]+/),
      P.string("]("),
      P.regexp(/[^\)\r\n]+/),
      P.string(")"),
      (_1, label, _2, href, _3) => {
        return mapper("a", {href})(label)
      })

    const img = P.seqMap(
      P.string("!["),
      P.regexp(/[^\]\r\n]+/),
      P.string("]("),
      P.regexp(/[^\)\r\n]+/),
      P.string(")"),
      (_1, alt, _2, src, _3) => {
        return mapper("img", {src, alt})(null)
      })

    const codeStart = P.string("`")
    const codeEnd = P.string("`")
    const code = codeStart
      .then(plainStr)
      .map(mapper("code"))
      .skip(codeEnd)

    const pluginInline = P.seqMap(
      P.string("@["),
      P.regexp(/[a-zA-Z]+/),
      P.regexp(/:{0,1}([^\]]*)/, 1),
      P.string("]"),
      (_1, pluginName, args, _2) => {
        return this.opts.plugins && this.opts.plugins[pluginName] ?
          this.opts.plugins[pluginName](args, null, mapper, join) : join([_1, pluginName, args, _2])
      }
    )

    const inline = P.alt(
        pluginInline,
        anchor,
        img,
        em,
        strong,
        code,
        P.regexp(/[^\r\n=-\[\]\*\`\@]+/),
        P.regexp(/./),
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
      (headers, _1, bodies) => mapper("table")(join([
        mapper("tr")(join(headers.map(h => mapper("th")(h)))),
        join(bodies.map(b => mapper("tr")(join(b.map(x => mapper("td")(x))))))
      ]))
    )

    const inlines = inline.atLeast(1).map(join)
    const paragraphBegin = inlines
    const paragraphEnd = ignore(/```\n.*\n```/)
    const paragraphLine = P.lazy(() => P.alt(
      P.seq(
        paragraphBegin,
        linebreak.skip(paragraphEnd).result(mapper("br")(null)),
        paragraphLine
      ).map(join),
      inlines
    ))
    const paragraph = paragraphLine
        .map(mapper("p"))

    const listIndent = P.string("  ")
    const liSingleLine = plainStr

    const ulStart = P.string("- ").or(P.string("* "))
    const olStart =  P.regexp(/[0-9]+\. /)


    let liLevel: number | null = null
    let liLevelBefore: number | null = null

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
      if(liLevel !== null && liLevelBefore !== null) {
        if(liLevelBefore == liLevel) {
          this.currentTree.children.push({
            value: x,
            children: [],
            type: nodeType,
            parent: this.currentTree
          })
        } else if(liLevelBefore < liLevel) {
          const currentTreeIndex = this.currentTree.children.length - 1
          this.currentTree = this.currentTree.children[currentTreeIndex]
          this.currentTree.children.push({
            children: [],
            type: nodeType,
            parent: this.currentTree,
            value: x
          })
        } else if(liLevelBefore > liLevel) {
          const unindetationStep = (liLevelBefore - liLevel - 1) / "  ".length
          for (let i = 0; i < unindetationStep; i++) {
            if(this.currentTree.parent !== null) {
              this.currentTree = this.currentTree.parent
            }
          }
          this.currentTree.children.push({
            type: nodeType,
            children: [],
            parent: this.currentTree,
            value: x
          })
        }
      }
      const _nodeType = nodeType
      return _nodeType
    })
    const lists = listLineContent.atLeast(1).skip(linebreak.atMost(1)).map(nodeTypes => {
      this.rootTree.type = nodeTypes[0]
      const result = treeToHtml(this.rootTree)
      this.rootTree = this.currentTree = {
        value: null,
        children: [],
        type: "shadow",
        parent: null
      }
      return result
    })


    const treeToHtml = (treeOrNode: ListTree) => {
      if(treeOrNode.type === "shadow") {
        return join(treeOrNode.children.map(treeToHtml))
      } else if(treeOrNode.children.length === 0 && treeOrNode.value !== null) {
        return mapper("li")(treeOrNode.value)
      } else if(treeOrNode.children.length !== 0 && treeOrNode.value !== null) {
        const {children} = treeOrNode
        return mapper("li")(join([treeOrNode.value, mapper(treeOrNode.children[0].type)(join(children.map(treeToHtml)))]))
      } else {
        const {children} = treeOrNode
        return mapper(treeOrNode.type)(join(children.map(treeToHtml)))
      }
    }

    const codeBlockBegin = P.regexp(/^```/)
    const codeBlockEnd = P.regexp(/^```/)
    const codeBlockDefinitionStr = P.regexp(/[^`\r\n]*/)
    const codeBlockStr = P.regexp(/[^`\r\n]+/)
    const codeBlock = P.seqMap(
        codeBlockBegin,
        codeBlockDefinitionStr,
        linebreak,
        linebreak.or(codeBlockStr.skip(linebreak)).many(),
        codeBlockEnd,
        (_1, definition, _2, code, _3) => {
          return mapper("pre")(mapper("code")(join(code)))
        })

    const blockquoteStr = P.regexp(/[^\r\n]+/)
    const blockquoteBegin = P.string("> ")
    
    const blockquoteLine = P.lazy(() => {
      let blockquoteLevel: number = 0
      return P.seqMap(
        blockquoteBegin.then(blockquoteBegin.many().map(x => blockquoteLevel = x.length)),
        blockquoteStr,
        linebreak.atMost(1),
        (_1, text, _2) => {
          return {text, blockquoteLevel}
        }
      )
    })
    interface IBlockquoteVertex {
      text: string | null
      children: IBlockquoteVertex[]
      parent?: IBlockquoteVertex
    }
    
    const createBlockquoteTree = (x: {text: string, blockquoteLevel: number}[]) => {
      let depth = 0
      let root: IBlockquoteVertex = {text: null, children: []}
      let currentNode = root
      for (const o of x) {
        if (o.blockquoteLevel < depth) {
          let node = {text: o.text, children: [], parent: currentNode.parent}
          console.log(depth - o.blockquoteLevel)
          console.log(node)
          for (let i = 0; i < depth - o.blockquoteLevel; i++) {
            if (currentNode.parent) {
              currentNode = currentNode.parent
            }
          }
          node.parent = currentNode
          currentNode.children.push(node)
          currentNode = node.parent
          depth = o.blockquoteLevel
        } else if (o.blockquoteLevel > depth) {
          let node = {text: o.text, children: [], parent: currentNode}
          let shadowNode = {text: null, children: [node], parent: currentNode}
          node.parent = shadowNode
          currentNode.children.push(shadowNode)
          currentNode = shadowNode
          depth = o.blockquoteLevel
        } else {
          let node = {text: o.text, children: [], parent: currentNode}
          currentNode.children.push(node)
        }
      }
      console.log(x)
      console.log(util.inspect(root, false, 10, true))
      return root      
    }
    const parseBlockquoteTree = (tree: IBlockquoteVertex, isRoot = false) => {
      let result: any[] = []
      for (const v of tree.children) {
        if (v.text !== null) {
          result.push(v.text)
        } else if (v.children.length !== 0) {
          result.push(parseBlockquoteTree(v))
        }
      }
      const _result = isRoot ? 
        mapper("blockquote")(mapper("p")(result.reduce((a, b) => join([a, mapper("br")(null), b]))))  
        : mapper("blockquote")(result.reduce((a, b) => join([a, mapper("br")(null), b])))
      return _result
    }
    const blockquote = P.lazy(() => {
      return blockquoteLine.atLeast(1).map(x => {
        return parseBlockquoteTree(createBlockquoteTree(x), true)
      }).skip(whitespace.many())
    })
    const pluginBlock = P.seqMap(
      P.string("@["),
      P.regexp(/[a-zA-Z]+/),
      P.regexp(/(:[^\]]*)*/),
      P.string("]\n"),
      P.seq(
        P.string("  ").result(""),
        P.regexp(/[^\r\n]+/),
        linebreak.atMost(1).result("\n"),
      ).map(join).atLeast(1).map(join),
      (_1, pluginName, args, _2, content) => {
        return this.opts.plugins && this.opts.plugins[pluginName] ? this.opts.plugins[pluginName](args, content, mapper, join)
          : join([_1, pluginName, args, _2, content])
      }
    )
    const block = P.alt(
      P.regexp(/\s+/).result(""),
      pluginBlock,
      lists,
      h1Special,
      h2Special,
      h6,
      h5,
      h4,
      h3,
      h2,
      h1,
      table,
      codeBlock,
      blockquote,
      paragraph,
      linebreak.result(""),
    )

    this.acceptables = P.alt(
      block
    ).many().map(join) as any as P.Parser<T>
  }
  parse(s: string) {
    this.liLevelBefore = this.liLevel = null
    this.rootTree = this.currentTree = {
      value: null,
      children: [],
      type: "shadow",
      parent: null
    }
    const parsed = this.acceptables.parse(s.trim())
    if(parsed.status === true && parsed.hasOwnProperty("value"))
      return this.opts.export.postprocess(parsed.value)
    console.error(s.trim())
    console.error(parsed)
    throw new Error("Parsing was failed.")
  }
}

export const asHTML: ExportType<string> = {
  mapper: (tag, args) => children => [
    "<" + tag,
    args  ? " " + Object.keys(args).map(x => `${x}="${args[x]}"`).join(" ") : "",
    children ? ">" + children + "</" + tag + ">" : " />"
  ].join(""),
  join: x => x.join(""),
  postprocess: x => x
}

export const asAST: ExportType<any> = {
  mapper: (tag, args) => children => [
    tag,
    args ? args : null,
    children
  ],
  join: x => x, // identical
  postprocess: (obj: Array<any>) => {
    return obj.filter(x => (x !== ''))
  }
}

const p = new Parser<any>({
  export: asHTML,
})
export const parse = (s: string) => {
  return p.parse(s)
}
