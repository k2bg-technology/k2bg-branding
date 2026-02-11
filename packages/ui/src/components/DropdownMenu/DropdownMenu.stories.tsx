import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Button } from '../Button';
import { Icon } from '../Icon';

import { DropdownMenu } from '.';

const meta = {
  component: DropdownMenu,
  argTypes: {
    children: {
      control: false,
      description: 'The menu items to display in the dropdown',
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state of the dropdown menu',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Default open state for uncontrolled usage',
    },
    modal: {
      control: 'boolean',
      description: 'Whether the dropdown should behave as a modal',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.dropdownMenu.description',
      },
      overview: 'components.dropdownMenu.overview',
      usage: 'components.dropdownMenu.usage',
      accessibility: 'components.dropdownMenu.accessibility',
      doList: 'components.dropdownMenu.doList',
      dontList: 'components.dropdownMenu.dontList',
      relatedComponents: 'components.dropdownMenu.relatedComponents',
      dependencies: 'components.dropdownMenu.dependencies',
      references: 'components.dropdownMenu.references',
    },
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button');

    await userEvent.click(button);
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <DropdownMenu.Trigger>
          <Button color="dark" variant="ghost" size="icon">
            <Icon name="inbox-stack" className="w-10 h-10" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Menu item 1
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Menu item 2
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Menu item 3
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </>
    ),
  },
};
