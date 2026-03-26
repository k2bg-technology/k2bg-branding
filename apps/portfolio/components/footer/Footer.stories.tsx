import type { Meta, StoryObj } from '@storybook/nextjs';

import jaTranslation from '../../i18n/locales/ja/translation.json';

import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  component: Footer,
  args: {
    copyright: jaTranslation.footer.copyright,
  },
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
