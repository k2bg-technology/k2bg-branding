import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Icon } from '../Icon';
import { Button } from '../Button';

import DropdownMenu from './DropdownMenu';
import DropdownMenuItem from './DropdownMenuItem';

const meta = {
  component: DropdownMenu,
  argTypes: {
    trigger: {
      control: false,
      description: 'The element that triggers the dropdown menu',
    },
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
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer">
            Menu item 1
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer">
            Menu item 2
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer">
            Menu item 3
          </a>
        </DropdownMenuItem>
      </>
    ),
    trigger: (
      <Button color="dark" variant="ghost" size="icon">
        <Icon name="inbox-stack" className="w-10 h-10" />
      </Button>
    ),
  },
};

export const WithTextTrigger: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer">
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer">
            Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer">
            Sign out
          </a>
        </DropdownMenuItem>
      </>
    ),
    trigger: (
      <Button color="main" variant="outline">
        Open menu
      </Button>
    ),
  },
};

export const WithIcons: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem>
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Icon name="user" className="w-4 h-4" />
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Icon name="cog-6-tooth" className="w-4 h-4" />
            Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Icon name="arrow-right-start-on-rectangle" className="w-4 h-4" />
            Sign out
          </a>
        </DropdownMenuItem>
      </>
    ),
    trigger: (
      <Button color="dark" variant="ghost" size="icon">
        <Icon name="ellipsis-vertical" className="w-6 h-6" />
      </Button>
    ),
  },
};

export const NavigationMenu: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem>
          <a href="/" className="flex items-center gap-2">
            <Icon name="home" className="w-4 h-4" />
            Home
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="/about" className="flex items-center gap-2">
            <Icon name="information-circle" className="w-4 h-4" />
            About
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="/contact" className="flex items-center gap-2">
            <Icon name="envelope" className="w-4 h-4" />
            Contact
          </a>
        </DropdownMenuItem>
      </>
    ),
    trigger: (
      <Button color="dark" variant="ghost" size="icon" aria-label="Navigation menu">
        <Icon name="bars-3" className="w-6 h-6" />
      </Button>
    ),
  },
};
