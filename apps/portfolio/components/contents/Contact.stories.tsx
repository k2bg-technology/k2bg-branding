import type { Meta, StoryObj } from '@storybook/nextjs';

import { useTranslation } from '../../i18n/client';

import { Contact } from './Contact';

const meta: Meta<typeof Contact> = {
  component: Contact,
  render: function Render() {
    const { t } = useTranslation('ja');

    return <Contact t={t} />;
  },
};

export default meta;

type Story = StoryObj<typeof Contact>;

export const Default: Story = {};
