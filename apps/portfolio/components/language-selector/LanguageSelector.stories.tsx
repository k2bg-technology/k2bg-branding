import type { Meta, StoryObj } from '@storybook/nextjs';

import { LanguageSelector } from './LanguageSelector';

const meta: Meta<typeof LanguageSelector> = {
  component: LanguageSelector,
};

export default meta;

type Story = StoryObj<typeof LanguageSelector>;

export const Default: Story = {};
