'use client';

import { Button } from 'ui';
import { useErrorBoundaryDictionary } from '../../components/providers/ErrorBoundaryDictionaryProvider';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: Props) {
  const dictionary = useErrorBoundaryDictionary();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-base-white px-6 text-base-default">
      <div className="flex max-w-xl flex-col items-start gap-spacious">
        <p className="text-body-r-sm leading-body-r-sm font-bold text-error">
          {error.digest}
        </p>
        <h1 className="text-heading-2 leading-heading-2 font-bold">
          {dictionary.title}
        </h1>
        <p className="text-body-r-md leading-body-r-md">{dictionary.message}</p>
        <Button type="button" color="main" onClick={reset}>
          {dictionary.retry}
        </Button>
      </div>
    </main>
  );
}
