import Link from 'next/link';
import { buttonVariants } from 'ui';

export function LanguageSelector() {
  return (
    <div className="fixed left-4 bottom-4 overflow-hidden rounded-md border w-max bg-white/80 shadow-xs">
      <Link
        href="/ja"
        className={buttonVariants({
          color: 'dark',
          variant: 'ghost',
          className: 'rounded-none',
        })}
        data-gtm="i18n_click_ja_button"
      >
        ja
      </Link>
      <Link
        href="/en"
        className={buttonVariants({
          color: 'dark',
          variant: 'ghost',
          className: 'rounded-none',
        })}
        data-gtm="i18n_click_en_button"
      >
        en
      </Link>
    </div>
  );
}
