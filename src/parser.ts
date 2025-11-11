import P = require("parsimmon")

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
    // Constants
    const LIST_INDENT = "  ";
    const LIST_INDENT_SIZE = LIST_INDENT.length;

    function flags(re: RegExp): string {
      const s = '' + re;
      return s.slice(s.lastIndexOf('/') + 1);
    }

    function ignore(re: RegExp, group: number = 0) {
      const {makeSuccess, makeFailure} = P as any

      const anchored = RegExp('^(?:' + re.source + ')', flags(re));
      const expected = '' + re;
      return (P as any)(function(input: string, i: number) {
        const match = anchored.exec(input.slice(i));
        if (match) {
          const fullMatch = match[0];
          const groupMatch = match[group];
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
    const codePlainStr = P.regexp(/[^`\r\n]+/)
    const linebreak = P.string("\r\n").or(P.string("\n")).or(P.string("\r"))
    const equal = P.string("=")
    const minus = P.string("-")


    const join:any = this.opts.export.join
    const mapper = this.opts.export.mapper
    const token = (p: P.Parser<any>) => {
      return p.skip(P.regexp(/\s*/m))
    }

    // Helper function to create header parsers (h1-h6)
    const createHeaderParser = (level: number, tagName: string) => {
      return token(P.seq(
        sharp.times(level),
        whitespace,
      ).then(plainStr)).map(mapper(tagName))
    }

    // Alternative header syntax (setext-style headers)
    const h1Special = P.regexp(/^(.*)\n\=+/, 1)
      .skip(P.alt(P.eof, P.string("\n")))
      .map(mapper("h1"))
    const h2Special = P.regexp(/^(.*)\n\-+/, 1)
      .skip(P.alt(P.eof, P.string("\n")))
      .map(mapper("h2"))

    // Atx-style headers (# syntax)
    const h1 = createHeaderParser(1, "h1")
    const h2 = createHeaderParser(2, "h2")
    const h3 = createHeaderParser(3, "h3")
    const h4 = createHeaderParser(4, "h4")
    const h5 = createHeaderParser(5, "h5")
    const h6 = createHeaderParser(6, "h6")

    // Strong (bold) text with properly matched delimiters
    const strongDoubleStar = P.string("**")
      .then(plainStr)
      .skip(P.string("**"))
      .map(mapper("strong"))
    const strongDoubleUnderscore = P.string("__")
      .then(plainStr)
      .skip(P.string("__"))
      .map(mapper("strong"))
    const strong = strongDoubleStar.or(strongDoubleUnderscore)

    // Emphasis (italic) text with properly matched delimiters
    const emStar = P.string("*")
      .then(plainStr)
      .skip(P.string("*"))
      .map(mapper("em"))
    const emUnderscore = P.string("_")
      .then(plainStr)
      .skip(P.string("_"))
      .map(mapper("em"))
    const em = emStar.or(emUnderscore)

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
      .then(codePlainStr)
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

    const listIndent = P.string(LIST_INDENT)
    const liSingleLine = codePlainStr

    const ulStart = P.string("- ").or(P.string("* "))
    const olStart =  P.regexp(/[0-9]+\. /)

    let liLevel: number[] = [1]
    let counter: number = 0
    const initializeList = () => {
      this.rootTree = this.currentTree = {
        value: null,
        children: [],
        type: "shadow",
        parent: null
      }
      liLevel = [1]
      counter = 0
    }
    const listLineContent = () => {
      return P.seqMap(
        listIndent.many(),
        P.index,
        ulStart.or(olStart),
        liSingleLine,
        (_1, index, start, str) => {
          let nodeType: "ul" | "ol"
          // detect which types of content
          liLevel.push(index.column)
          nodeType = ((start == "* ") || (start == "- ")) ? "ul" : "ol"
          counter += 1
          return {counter, nodeType, str, liLevel, index}
        }
      )
      .skip(linebreak.atMost(1))
      .chain(v => {
        // Check if all indentation levels are odd numbers (1, 3, 5, 7...)
        // This ensures proper 2-space indentation (column 1, 3, 5...)
        const hasInvalidIndentation = v.liLevel.some(level => level % 2 !== 1);
        if (hasInvalidIndentation) {
          initializeList();
          return P.fail("Invalid list indentation: must use 2-space indents")
        }
        return P.succeed(v)
      })
      .map(v => {
        const liLevelBefore = liLevel[v.counter - 1]
        const liLevelCurrent = liLevel[v.counter]

        // Handle three cases of list item indentation:
        // 1. Same level: add sibling to current parent
        if(liLevelBefore === liLevelCurrent) {
          this.currentTree.children.push({
            value: v.str,
            children: [],
            type: v.nodeType,
            parent: this.currentTree
          })
        }
        // 2. Increased indentation: nest deeper (add child to last item)
        else if(liLevelBefore < liLevelCurrent) {
          const currentTreeIndex = this.currentTree.children.length - 1
          if (currentTreeIndex >= 0) {
            this.currentTree = this.currentTree.children[currentTreeIndex]
          }
          this.currentTree.children.push({
            children: [],
            type: v.nodeType,
            parent: this.currentTree,
            value: v.str
          })
        }
        // 3. Decreased indentation: navigate back up the tree
        else if(liLevelBefore > liLevelCurrent) {
          const unindetationStep = (liLevelBefore - liLevelCurrent) / LIST_INDENT_SIZE
          // Navigate up the tree, with null safety checks
          for (let i = 0; i < unindetationStep; i++) {
            if(this.currentTree.parent !== null) {
              this.currentTree = this.currentTree.parent
            } else {
              // Reached root but still need to go up - reset to root
              break;
            }
          }
          this.currentTree.children.push({
            type: v.nodeType,
            children: [],
            parent: this.currentTree,
            value: v.str
          })
        }
        const _nodeType = v.nodeType
        return _nodeType
      })
    }
    /**
     * Parse markdown lists (ul/ol)
     * Builds a tree structure and converts it to the output format
     */
    const lists = P.lazy(() => {
      return listLineContent().atLeast(1).map(nodeTypes => {
        this.rootTree.type = nodeTypes[0]
        const result = treeToHtml(this.rootTree)
        // Reset list state after parsing
        initializeList()
        return result
      })
    })

    /**
     * Convert list tree structure to output format
     * Handles four cases:
     * 1. Shadow node (container): render children only
     * 2. Leaf node (no children): simple list item
     * 3. Node with value and children: list item containing nested list
     * 4. Container node: wrap children in ul/ol tag
     */
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
        linebreak.or(codeBlockStr.lookahead(linebreak)).many(),
        codeBlockEnd,
        (_1, definition, _2, code, _3) => {
          // Remove the last empty line before closing ``` (immutable way)
          const codeLines = code.slice(0, -1)
          if (definition === "")
            return mapper("pre")(mapper("code")(join(codeLines)))
          return mapper("pre", { "data-language": definition})(mapper("code")(join(codeLines)))
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
    /**
     * Tree node structure for blockquotes
     * Supports nested blockquotes with multiple levels
     */
    interface IBlockquoteVertex {
      text: string | null
      children: IBlockquoteVertex[]
      parent?: IBlockquoteVertex
    }

    /**
     * Build a tree structure from parsed blockquote lines
     * Handles nested blockquotes based on '>' prefix depth
     */
    const createBlockquoteTree = (x: {text: string, blockquoteLevel: number}[]) => {
      let depth = 0
      let root: IBlockquoteVertex = {text: null, children: []}
      let currentNode = root
      for (const o of x) {
        if (o.blockquoteLevel < depth) {
          let node = {text: o.text, children: [], parent: currentNode.parent}
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
      return root
    }
    const parseBlockquoteTree = (tree: IBlockquoteVertex, isRoot = false) => {
      let result: any[] = []
      for (const [i, v] of tree.children.entries()) {
        if (v.text !== null) {
          if (tree.children[i + 1] && typeof tree.children[i + 1].text === "string") {
            result.push(join([v.text, mapper("br")(null)]))
          } else {
            result.push(v.text)
          }
        } else if (v.children.length !== 0) {
          result.push(parseBlockquoteTree(v))
        }
      }
      const _result = mapper("blockquote")(result.reduce((a, b) => join([a, b])))
      return _result
    }
    const blockquote = P.lazy(() => {
      return blockquoteLine.atLeast(1).map(x => {
        return parseBlockquoteTree(createBlockquoteTree(x), true)
      })
    })
    const pluginBlock = P.seqMap(
      P.string("@["),
      P.regexp(/[a-zA-Z]+/),
      P.regexp(/(:[^\]]*)*/),
      P.string("]\n"),
      P.seq(
        P.string(LIST_INDENT).result(""),
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
      lists,
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

    // Provide detailed error information
    const errorDetails = parsed.status === false && 'expected' in parsed
      ? `Expected ${(parsed as any).expected.join(', ')} at index ${(parsed as any).index.offset}`
      : 'Unknown parsing error';
    throw new Error(`Markdown parsing failed: ${errorDetails}\nInput: ${s.trim().substring(0, 100)}${s.trim().length > 100 ? '...' : ''}`)
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


export const parse = (s: string) => {
  const p = new Parser<any>({
    export: asHTML,
  })
  return p.parse(s)
}
