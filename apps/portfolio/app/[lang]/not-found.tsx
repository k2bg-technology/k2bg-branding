import Link from 'next/link';
import { buttonVariants } from 'ui';
import { getDictionary } from '../../i18n/dictionaries';
import { getRequestLanguage } from '../../i18n/requestLanguage';

export default async function NotFound() {
  const language = await getRequestLanguage();
  const dictionary = await getDictionary(language);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-base-white px-6 text-base-default">
      <div className="flex max-w-xl flex-col items-start gap-spacious">
        <p className="text-body-r-sm leading-body-r-sm font-bold text-main-default">
          404
        </p>
        <h1 className="text-heading-2 leading-heading-2 font-bold">
          {dictionary.notFound.title}
        </h1>
        <p className="text-body-r-md leading-body-r-md">
          {dictionary.notFound.message}
        </p>
        <Link
          href={`/${language}`}
          className={buttonVariants({ color: 'main', variant: 'default' })}
        >
          {dictionary.notFound.returnHome}
        </Link>
      </div>
    </main>
  );
}
