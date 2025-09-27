import React, { useEffect } from 'react';
import { Suspense } from 'react';
import type { Preview, StoryContext, StoryFn } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import { DocsContainer } from '@storybook/addon-docs/blocks';
import i18n from '../src/i18n';

import '../src/globals.css';

i18n.on('languageChanged', (locale) => {
  const direction = i18n.dir(locale);
  document.dir = direction;
});

// Wrap your stories in the I18nextProvider component
function withI18next(Story: StoryFn, context: StoryContext) {
  const { locale } = context.globals;

  // When the locale global changes
  // Set the new locale in i18n
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    // This catches the suspense from components not yet ready (still loading translations)
    // Alternative: set useSuspense to false on i18next.options.react when initializing i18next
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    </Suspense>
  );
}

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
        order: [
          'guidelines',
          ['Introduction', 'Accessibility', 'Responsive'],
          'foundations',
          'components',
        ],
      },
    },
    docs: {
      container: ({ context, children }) => {
        const { locale } = context.store.userGlobals.globals;

        // When the locale global changes
        // Set the new locale in i18n
        useEffect(() => {
          i18n.changeLanguage(locale);
        }, [locale]);

        return (
          <Suspense fallback={<div>loading translations...</div>}>
            <I18nextProvider i18n={i18n}>
              <DocsContainer context={context}>{children}</DocsContainer>
            </I18nextProvider>
          </Suspense>
        );
      },
    },
  },
  // Create a global variable called locale in storybook
  // and add a menu in the toolbar to change your locale
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'ja', title: '日本語' },
        ],
        showName: true,
      },
    },
  },
  decorators: [withI18next],
  tags: ['autodocs'],
};

export default preview;
