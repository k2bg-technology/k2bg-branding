import { NotionToMarkdown } from 'notion-to-md';
import { BlockType, CustomTransformer } from 'notion-to-md/build/types';

import { Core } from './core';

export class N2m extends Core {
  n2m: NotionToMarkdown;

  constructor() {
    super();

    this.n2m = new NotionToMarkdown({ notionClient: this.notionClient });
  }

  setCustomTransformer(type: BlockType, transformer: CustomTransformer) {
    this.n2m.setCustomTransformer(type, transformer);
  }

  async fetchNotionPageAndConvertMarkdownString(pageId: string) {
    const mdblocks = await this.n2m.pageToMarkdown(pageId);
    const mdString = this.n2m.toMarkdownString(mdblocks);

    return mdString.parent;
  }
}
