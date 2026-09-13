'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { Dictionary } from '../../i18n/types';

type ErrorBoundaryDictionary = Dictionary['errorBoundary'];

const fallbackDictionary: ErrorBoundaryDictionary = {
  title: 'エラーが発生しました',
  message:
    'ページの表示中に問題が発生しました。時間をおいて再度お試しください。',
  retry: '再試行',
};

const ErrorBoundaryDictionaryContext =
  createContext<ErrorBoundaryDictionary | null>(null);

interface Props {
  children: ReactNode;
  dictionary: ErrorBoundaryDictionary;
}

export function ErrorBoundaryDictionaryProvider({
  children,
  dictionary,
}: Props) {
  return (
    <ErrorBoundaryDictionaryContext.Provider value={dictionary}>
      {children}
    </ErrorBoundaryDictionaryContext.Provider>
  );
}

export function useErrorBoundaryDictionary() {
  return useContext(ErrorBoundaryDictionaryContext) ?? fallbackDictionary;
}
