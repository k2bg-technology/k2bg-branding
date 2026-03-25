import type { Meta, StoryObj } from '@storybook/nextjs';

import jaTranslation from '../../i18n/locales/ja/translation.json';

import { Contact } from './Contact';

const meta: Meta<typeof Contact> = {
  component: Contact,
  args: {
    dictionary: jaTranslation.contact,
  },
};

export default meta;

type Story = StoryObj<typeof Contact>;

export const Default: Story = {};
