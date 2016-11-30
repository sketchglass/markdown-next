# markdown-next
markdown-next parser

[![CircleCI](https://circleci.com/gh/sketchglass/markdown-next.svg?style=svg)](https://circleci.com/gh/sketchglass/markdown-next) [![npm version](https://badge.fury.io/js/markdown-next.svg)](https://badge.fury.io/js/markdown-next)

Below is the list of what is supported:
- [x] strong
- [x] em
- [x] p
- [x] headers(h1, h2, h3, h4, h5, h6)
- [x] ul
- [x] ol
- [x] a
- [x] code
- [x] blockquote(nesting is allowed)
- [x] table
- [x] img

Note: This project is currently beta. Any API will be changed without notice.

## Install
Clone this repo and execute `npm run install`.

## Basic Usage

```
const markdown = require("markdown-next")
```

### parse(s: string): string
Returns parsed html string.
This is mostly shorthand of `new Parser({type: asHTML}).parse`.
```
parse(string)
```

### Parser({export: ExportType})

It takes `ExportType` object and make new parser.
Currently, there are two options: `asHTML` and `asAST` which creates HTML and AST respectively

```
const markdown = require("markdown-next")
const parser = new markdown.Parser({
  export: markdown.asHTML
})
parser.parse(string)
```

## Test and Development
Run `npm test` command for testing. Under `test` contains unit tests.

## Contribution
Any suggestion or PR is welcome.

## LICENSE
MIT
