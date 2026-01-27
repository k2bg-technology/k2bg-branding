import type { Meta, StoryObj } from '@storybook/nextjs';

import { Markdown } from '.';

const meta: Meta<typeof Markdown> = {
  title: 'Markdown',
  component: Markdown,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic markdown rendering example
 */
export const Default: Story = {
  args: {
    content: '# Hello, Markdown!\n\nThis is a sample markdown content.',
  },
};

/**
 * Displays all heading levels (h1, h2, h3)
 */
export const Headings: Story = {
  args: {
    content: `# Heading 1

## Heading 2

### Heading 3

This is a paragraph below the headings.`,
  },
};

/**
 * Paragraphs with text formatting and emphasis
 */
export const Paragraphs: Story = {
  args: {
    content: `This is a normal paragraph with some text.

This is another paragraph with **bold text** and *italic text*.

You can also use **_bold and italic_** together.`,
  },
};

/**
 * Unordered and ordered lists
 */
export const Lists: Story = {
  args: {
    content: `## Unordered List

- Item 1
- Item 2
- Item 3
  - Nested item 1
  - Nested item 2

## Ordered List

1. First item
2. Second item
3. Third item`,
  },
};

/**
 * Links with external URL handling
 */
export const Links: Story = {
  args: {
    content: `Here is a [link to Google](https://google.com).

You can also use [multiple](https://example.com) [links](https://github.com) in one paragraph.`,
  },
};

/**
 * Inline code and code blocks with syntax highlighting
 */
export const Code: Story = {
  args: {
    content: `Here is some \`inline code\` in a sentence.

Here is a code block:

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
  return true;
}
\`\`\`

Another example with TypeScript:

\`\`\`typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'John',
  age: 30
};
\`\`\``,
  },
};

/**
 * Blockquote styling
 */
export const Blockquote: Story = {
  args: {
    content: `> This is a blockquote.
> It can span multiple lines.

Normal paragraph after the quote.

> Another quote here.`,
  },
};

/**
 * Table rendering with GFM syntax
 */
export const Table: Story = {
  args: {
    content: `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
| Cell 7   | Cell 8   | Cell 9   |`,
  },
};

/**
 * GitHub Flavored Markdown features
 */
export const GFM: Story = {
  args: {
    content: `## Task List

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Strikethrough

~~This text is crossed out~~

## Automatic Links

Visit https://github.com for more information.`,
  },
};

/**
 * Custom directive example
 *
 * @remarks
 * This story may cause infinite re-renders due to a known Storybook issue with async RSC stories.
 * See: https://github.com/storybookjs/storybook/issues/30317
 */
export const Directive: Story = {
  args: {
    content: `Here is a custom embed directive:

::embed{id=example123 type=EMBED_TYPE}

This should render a custom embed component.`,
  },
};

/**
 * Complete article example combining multiple elements
 */
export const Article: Story = {
  args: {
    content: `# Complete Article Example

This is an introductory paragraph that explains what this article is about.

## Section 1: Introduction

In this section, we introduce the **main concepts** and provide some context.

### Subsection 1.1

Here's a list of key points:

- Point 1: Important information
- Point 2: More details
- Point 3: Additional context

## Section 2: Code Examples

Let's look at some code:

\`\`\`javascript
const example = {
  name: 'Example',
  value: 42
};

console.log(example);
\`\`\`

You can also use \`inline code\` within paragraphs.

## Section 3: Data

| Feature | Description | Status |
|---------|-------------|--------|
| Feature A | First feature | ✅ Done |
| Feature B | Second feature | 🚧 In Progress |
| Feature C | Third feature | ⏳ Planned |

## Conclusion

> Remember: Always write clean and maintainable code.

For more information, visit [our documentation](https://example.com).`,
  },
};

/**
 * Long content example for scroll testing
 */
export const LongContent: Story = {
  args: {
    content: `# Long Content Example

${Array.from(
  { length: 10 },
  (_, i) => `
## Section ${i + 1}

This is section ${
    i + 1
  } with multiple paragraphs to demonstrate how the component handles longer content.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Subsection ${i + 1}.1

- List item 1
- List item 2
- List item 3

\`\`\`typescript
// Code example in section ${i + 1}
function example${i + 1}() {
  return ${i + 1};
}
\`\`\`
`
).join('\n')}`,
  },
};

/**
 * Empty content edge case
 */
export const Empty: Story = {
  args: {
    content: '',
  },
};

/**
 * Minimal content with just plain text
 */
export const Minimal: Story = {
  args: {
    content: 'Just a simple line of text.',
  },
};
