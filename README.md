# generic-markdown-parser
[wip]Generic markdown parser

Below is the list of what this is supported:
- [x] strong
- [x] em
- [x] p
- [x] headers(h1, h2, h3, h4, h5, h6)
- [x] ul
- [x] ol
- [x] a
- [x] code
- [x] blockquote(nesting is allowed)
- [ ] table
- [ ] img

Note: This project is currently beta. Any API will be changed without notice.

## Install
Clone this repo and execute `npm run install`.

## Usage

```
import {parse} from "generic-markdown-parser"
```

### parse(s: string): string
Returns parsed html string.
```
parse(string)
```

## Test and Development
Run `npm test` command for testing. Under `src/test` contains unit testings.

## Contribution
Any PR is welcome.

## LICENSE
MIT
