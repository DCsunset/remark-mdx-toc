import { Heading, Root } from "mdast";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import { MDXJSEsm } from "mdast-util-mdx";
import { name as isIdentifierName } from 'estree-util-is-identifier-name';
import { valueToEstree } from 'estree-util-value-to-estree';
import { Plugin } from "unified";
import { RemarkMdxTocOptions, TocEntry } from "../index";

export const remarkMdxToc: Plugin<[RemarkMdxTocOptions?]> = (options = {}) => (
	(ast) => {
		const mdast = ast as Root;
		const name = options.name ?? "toc";
		if (!isIdentifierName(name)) {
			throw new Error(`Invalid name for an identifier: ${name}`);
		}

		// structured toc
		const toc: TocEntry[] = [];
		// flat toc (share objects in toc, only for iterating)
		const flatToc: TocEntry[] = [];
		const createEntry = (node: Heading): TocEntry => ({
			depth: node.depth,
			value: toString(node, { includeImageAlt: false }),
			children: []
		});

		visit(mdast, "heading", node => {
			const entry = createEntry(node);
			flatToc.push(entry);

			// find the last node that is less deep (parant)
			// Fall back to root
			let parent: TocEntry[] = toc;
			for (let i = flatToc.length - 1; i >= 0; --i) {
				const current = flatToc[i];
				if (current.depth < entry.depth) {
					parent = current.children;
					break;
				}
			}
			parent.push(entry);
		});

		// Export in MDX
		const tocExport: MDXJSEsm = {
			type: "mdxjsEsm",
			value: "",
			data: {
				estree: {
					type: "Program",
					sourceType: "module",
					body: [
						{
							type: "ExportNamedDeclaration",
							specifiers: [],
							source: null,
							declaration: {
								type: "VariableDeclaration",
								kind: "const",
								declarations: [
									{
										type: "VariableDeclarator",
										id: {
											type: "Identifier",
											name
										},
										init: valueToEstree(toc)
									}
								]
							}
						}
					]
				}
			}
		};
		mdast.children.unshift(tocExport);
	}
);
