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

export declare const remarkMdxToc: Plugin<[RemarkMdxTocOptions?]>;
