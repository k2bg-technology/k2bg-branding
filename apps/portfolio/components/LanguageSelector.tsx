import Link from 'next/link';
import { Button } from 'ui';

export function LanguageSelector() {
  return (
    <div className="fixed left-4 bottom-4 overflow-hidden rounded-md border w-max bg-white/80 shadow-xs">
      <Button
        type="button"
        color="dark"
        variant="ghost"
        asChild
        className="rounded-none"
        data-gtm="i18n_click_ja_button"
      >
        <Link href="/ja">ja</Link>
      </Button>
      <Button
        type="button"
        color="dark"
        variant="ghost"
        asChild
        className="rounded-none"
        data-gtm="i18n_click_en_button"
      >
        <Link href="/en">en</Link>
      </Button>
    </div>
  );
}
