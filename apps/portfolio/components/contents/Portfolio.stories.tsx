import type { Meta, StoryObj } from '@storybook/nextjs';

import jaTranslation from '../../i18n/locales/ja/translation.json';

import { Portfolio } from './Portfolio';

const meta: Meta<typeof Portfolio> = {
  component: Portfolio,
  args: {
    dictionary: jaTranslation.portfolio,
  },
};

export default meta;

type Story = StoryObj<typeof Portfolio>;

export const Default: Story = {};
