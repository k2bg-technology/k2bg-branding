import type { Preview } from '@storybook/react';

import '../src/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: ['guideline', 'foundations', 'components'],
      },
    },
  },
};

export default preview;
