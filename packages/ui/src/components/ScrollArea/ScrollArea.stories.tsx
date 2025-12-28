import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ScrollArea } from './ScrollArea';

const meta = {
  component: ScrollArea,
  args: {
    className:
      'h-[200px] w-[350px] rounded-md border border-base-default/10 p-4',
    children: `Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the place: under the king's pillow, in his soup, even in the royal toilet. The king was furious, but he couldn't seem to stop Jokester. And then, one day, the people of the kingdom discovered that the jokes left by Jokester were so funny that they couldn't help but laugh. And once they started laughing, they couldn't stop.`,
  },
  parameters: {
    docs: {
      description: {
        component: 'components.scrollArea.description',
      },
      overview: 'components.scrollArea.overview',
      usage: 'components.scrollArea.usage',
      accessibility: 'components.scrollArea.accessibility',
      doList: 'components.scrollArea.doList',
      dontList: 'components.scrollArea.dontList',
      relatedComponents: 'components.scrollArea.relatedComponents',
      dependencies: 'components.scrollArea.dependencies',
      references: 'components.scrollArea.references',
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VerticalScroll: Story = {
  args: {
    className: 'h-[150px] w-[300px] rounded-md border border-base-default/10 p-4',
    children: (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="py-2 border-b border-base-default/10">
            Item {i + 1}
          </div>
        ))}
      </div>
    ),
  },
};

export const HorizontalScroll: Story = {
  args: {
    className: 'h-auto w-[300px] rounded-md border border-base-default/10 p-4',
    children: (
      <div className="flex gap-4 w-max">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-32 h-20 rounded bg-base-default/10 flex items-center justify-center"
          >
            Card {i + 1}
          </div>
        ))}
      </div>
    ),
  },
};

export const LongContent: Story = {
  args: {
    className: 'h-[300px] w-[400px] rounded-md border border-base-default/10 p-4',
    children: (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Article Title</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo.
        </p>
        <p>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
          fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
          sequi nesciunt.
        </p>
        <p>
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
          consectetur, adipisci velit, sed quia non numquam eius modi tempora
          incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
        </p>
      </div>
    ),
  },
};

export const CompactSize: Story = {
  args: {
    className: 'h-[100px] w-[200px] rounded-md border border-base-default/10 p-2 text-sm',
    children: `A compact scroll area for smaller content sections. This is useful for sidebars, tooltips, or any constrained space that needs scrollable content.`,
  },
};
