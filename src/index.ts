import { Heading, Root } from "mdast";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import { MdxjsEsm, MdxJsxFlowElement } from "mdast-util-mdx";
import { name as isIdentifierName } from 'estree-util-is-identifier-name';
import { valueToEstree } from 'estree-util-value-to-estree';
import { Plugin } from "unified";

export type TocEntry = {
	depth: number,
	// value of the heading
	value: string,
	children: TocEntry[]
};

export interface RemarkMdxTocOptions {
	/**
	 * If specified, export toc using the name.
	 * Otherwise, use `toc` as the name.
	 */
	name?: string
};


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
		const createEntry = (node: Heading | MdxJsxFlowElement): TocEntry => {
			if (node.type === "heading") {
				return {
					depth: node.depth,
					value: toString(node, { includeImageAlt: false }),
					children: []
				}
			}
			else {
				// parse depth from heading tag
				const depth = parseInt(node.name!.substring(1));
				return {
					depth: depth,
					value: toString(node, { includeImageAlt: false }),
					children: []
				};
			}
		};

		visit(mdast, ["heading", "mdxJsxFlowElement"], node => {
			if (
				node.type !== "heading" &&
				(node.type === "mdxJsxFlowElement" &&
					!/^h[1-6]$/.test(node.name || ""))
			) {
				return;
			}
			const entry = createEntry(node as any);
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
		const tocExport: MdxjsEsm = {
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
