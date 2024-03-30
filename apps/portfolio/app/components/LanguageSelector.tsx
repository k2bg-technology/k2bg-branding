import Link from 'next/link';

export function LanguageSelector() {
  return (
    <div className="fixed left-2 bottom-2">
      <div className="inline-flex -space-x-px overflow-hidden rounded-md border bg-white/80 shadow-sm">
        <Link href="/ja">
          <button
            type="button"
            className="inline-block m-0 px-4 py-2 text-button-r-sm leading-button-sm hover:bg-gray-50 focus:relative"
          >
            ja
          </button>
        </Link>
        <Link href="/en">
          <button
            type="button"
            className="inline-block px-4 py-2 text-button-r-sm leading-button-sm hover:bg-gray-50 focus:relative"
          >
            en
          </button>
        </Link>
      </div>
    </div>
  );
}
