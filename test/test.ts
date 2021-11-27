// js extension is necessary for esm
import { remarkMdxToc } from "../src/index.js";
import { compileSync } from "@mdx-js/mdx";
import fs from "fs";
import path from 'path';
import { fileURLToPath  } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const content = compileSync(fs.readFileSync(path.join(__dirname, "example.mdx")), {
	jsx: true,
	remarkPlugins: [remarkMdxToc]
});

console.log(content.value);
