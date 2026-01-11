import {
  DocsContainer,
  type DocsContainerProps,
} from '@storybook/addon-docs/blocks';
import type { Preview, StoryContext } from '@storybook/react';
import type React from 'react';
import { type PropsWithChildren, Suspense, useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import type { PartialStoryFn } from 'storybook/internal/types';
import type { StoryStore } from 'storybook/preview-api';
import i18n from '../src/i18n';
import DocumentationTemplate from './DocumentationTemplate.mdx';

import '../src/globals.css';

i18n.on('languageChanged', (locale) => {
  const direction = i18n.dir(locale);
  document.dir = direction;
});

function I18nChangeLocaleProvider(
  props: PropsWithChildren<{
    locale: string;
  }>
) {
  // When the locale global changes
  // Set the new locale in i18n
  useMemo(() => {
    i18n.changeLanguage(props.locale);
  }, [props.locale]);

  return (
    // This catches the suspense from components not yet ready (still loading translations)
    // Alternative: set useSuspense to false on i18next.options.react when initializing i18next
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>{props.children}</I18nextProvider>
    </Suspense>
  );
}

// Wrap your stories in the I18nextProvider component
function withI18next(Story: PartialStoryFn, context: StoryContext) {
  const { locale } = context.globals;

  return (
    <I18nChangeLocaleProvider locale={locale}>
      <Story />
    </I18nChangeLocaleProvider>
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
      container: ({
        context,
        children,
      }: {
        context: DocsContainerProps['context'] & {
          // biome-ignore lint/suspicious/noExplicitAny: --- IGNORE ---
          store: StoryStore<any>;
        };
        children: React.ReactNode;
      }) => {
        const { locale } = context.store.userGlobals.globals;

        return (
          <I18nChangeLocaleProvider locale={locale}>
            <DocsContainer context={context}>{children}</DocsContainer>
          </I18nChangeLocaleProvider>
        );
      },
      page: DocumentationTemplate,
      codePanel: true,
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
