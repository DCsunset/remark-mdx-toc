// js extension is necessary for esm
import { remarkMdxToc } from "../src/index.js";
import { compileSync } from "@mdx-js/mdx";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { remarkHeadingId } from 'remark-custom-heading-id';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const content = compileSync(fs.readFileSync(path.join(__dirname, "example.mdx")), {
	jsx: true,
	remarkPlugins: [
		remarkHeadingId,
		[remarkMdxToc, {
			name: "toc",
			customTags: [{
				name: /^H[1-6]$/,
				depth: name => parseInt(name.substring(1))
			}]
		}]
	]
});

console.log(content.value);
