import type { Meta, StoryObj } from '@storybook/nextjs';

import jaTranslation from '../../i18n/locales/ja/translation.json';

import { HorizontalScrollHint } from './HorizontalScrollHint';

const meta: Meta<typeof HorizontalScrollHint> = {
  component: HorizontalScrollHint,
  args: {
    dictionary: jaTranslation.horizontalScrollHint,
  },
};

export default meta;

type Story = StoryObj<typeof HorizontalScrollHint>;

export const Default: Story = {};
