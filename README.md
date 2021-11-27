# remark-mdx-toc

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
# Hello, world

## Title 1

Content 1

### Subtitle 1

Sub Content 1

## Title 2

Content 2
```

Then the output of the above code is similar to the following:

```jsx
export const toc = [{
  "depth": 1,
  "value": "Hello, world",
  "children": [{
    "depth": 2,
    "value": "Title 1",
    "children": [{
      "depth": 3,
      "value": "Subtitle 1",
      "children": []
    }]
  }, {
    "depth": 2,
    "value": "Title 2",
    "children": []
  }]
}];

function MDXContent(props = {}) {
  // ...
}
export default MDXContent;
```


## Options

* `name`: The exported variable name of the toc. By default, it's `toc`.


## License

GPL-3.0
