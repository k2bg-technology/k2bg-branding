import type { Meta, StoryObj } from '@storybook/nextjs';

import { TableOfContents } from './TableOfContents';

const meta: Meta<typeof TableOfContents> = {
  title: 'TableOfContents',
  component: TableOfContents,
  args: {
    headings: [
      { id: 'introduction', text: 'Introduction', level: 2 },
      { id: 'sub-section', text: 'Sub Section', level: 3 },
      { id: 'conclusion', text: 'Conclusion', level: 2 },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
