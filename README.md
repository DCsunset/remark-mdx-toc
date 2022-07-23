# remark-mdx-toc

[![Version](https://img.shields.io/npm/v/remark-mdx-toc.svg)](https://npmjs.org/package/remark-mdx-toc)

A remark plugin to generate toc and convert it into MDX export

## Installation

```
npm install remark-mdx-toc
```

Note: This package uses [ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
Use Node 12+ and ESM import syntax to use this package.

## Usage

```js
import { remarkMdxToc } from "remark-mdx-toc";
// This uses @mdx-js/mdx v2
import { compileSync } from "@mdx-js/mdx";
import fs from "fs";

const content = compileSync(fs.readFileSync("example.mdx"), {
  jsx: true,
  remarkPlugins: [remarkMdxToc],
  // Or specify the exported identifier
  // remarkPlugins: [
  //   [remarkMdxToc, { name: "toc" }]
  // ]
});

console.log(content.value);
```

Suppose the `example.mdx` has the following content:

```md
# Hello, world {#hello-world}

## Title 1

Content 1

### Subtitle 1

Sub Content 1

<h2 id="title-2">Title 2</h2>

Content 2
```

Then the output of the above code is similar to the following:

```jsx
export const toc = [{
  "depth": 1,
  "value": "Hello, world",
  "attributes": {
    "id": "hello-world"
  },
  "children": [{
    "depth": 2,
    "value": "Title 1",
    "attributes": {},
    "children": [{
      "depth": 3,
      "value": "Subtitle 1",
      "attributes": {},
      "children": []
    }]
  }, {
    "depth": 2,
    "value": "Title 2",
    "attributes": { "id": "title-2" }
    "children": []
  }]
}];

function MDXContent(props = {}) {
  // ...
}
export default MDXContent;
```

- HTML heading tags (`h1`-`h6`) are supported.
- Custom tags can also be added through options.
- `{#id}` syntax needs [remark-heading-id](https://github.com/imcuttle/remark-heading-id) plugin.

## Options

* `name`: The exported variable name of the toc. By default, it's `toc`.
* `customTags`: Add custom tags to toc.

`customTags` is an array of `CustomTag` defined below:

```ts
type CustomTag = {
  /// regex to match the tag name
  name: RegExp,
  /// get depth from name
  depth: (name: string) => number
}
```


## License

GPL-3.0
