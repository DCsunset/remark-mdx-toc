import { Root, Heading } from "mdast";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import { MdxjsEsm } from "mdast-util-mdx";
import { name as isIdentifierName } from 'estree-util-is-identifier-name';
import { valueToEstree } from 'estree-util-value-to-estree';
import { Plugin } from "unified";
import { MdxJsxFlowElement, MdxJsxAttribute } from "mdast-util-mdx-jsx";

export type TocEntry = {
	depth: number,
	// value of the heading
	value: string,
	attributes: {[key: string]: string},
	children: TocEntry[]
};

export type CustomTag = {
  /// regex to match the tag name
	name: RegExp,
	/// get depth from name
	depth: (name: string) => number
};

export interface RemarkMdxTocOptions {
	/**
	 * If specified, export toc using the name.
	 * Otherwise, use `toc` as the name.
	 */
	name?: string
	/**
	 * Add custom tag to toc
	 */
	customTags?: CustomTag[],
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
		const createEntry = (node: Heading | MdxJsxFlowElement, depth: number): TocEntry => {
			let attributes = (node.data || {}) as TocEntry['attributes'];
			if (node.type === "mdxJsxFlowElement") {
				 attributes = Object.fromEntries(
					node.attributes
						.filter(attribute => attribute.type === 'mdxJsxAttribute' && typeof attribute.value === 'string')
						.map(attribute => [(attribute as MdxJsxAttribute).name, attribute.value])
					) as TocEntry['attributes'];
			}
			return {
				depth,
				value: toString(node, { includeImageAlt: false }),
				attributes,
				children: []
			}
		};

		visit(mdast, ["heading", "mdxJsxFlowElement"], node => {
			let depth = 0;
			if (node.type === "mdxJsxFlowElement") {
				let valid = false;
				if (/^h[1-6]$/.test(node.name || "")) {
					valid = true;
					depth = parseInt(node.name!.substring(1));
				}
				else if (options.customTags) {
					for (const tag of options.customTags) {
						if (tag.name.test(node.name || "")) {
							valid = true;
							depth = tag.depth(node.name || "");
							break;
						}
					}
				}

				if (!valid) {
					return;
				}
			}
			else if (node.type === "heading") {
				depth = node.depth;
			}
			else {
				return;
			}

			const entry = createEntry(node, depth);
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
