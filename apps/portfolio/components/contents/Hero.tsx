import Image from 'next/image';
import type { Dictionary } from '../../i18n/dictionaries';

type HeroDictionary = Dictionary['hero'];

export function Hero({ dictionary }: { dictionary: HeroDictionary }) {
  return (
    <section>
      <div className="grid grid-rows-[max(22rem)_1fr] grid-cols-full h-full md:grid-rows-1 md:grid-cols-[max(22rem)_max(50rem)]">
        <div className="relative">
          <Image
            src="/images/hero.jpg"
            fill
            alt="Hero Image"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-6 p-6 md:justify-center md:p-12">
          <hgroup className="flex flex-col gap-2 md:gap-0">
            <h1 className="text-heading-1 leading-tight font-bold md:leading-heading-1">
              {dictionary.corporateName}
            </h1>
            <p className="text-body-r-md leading-body-r-md">
              {dictionary.officialName}
            </p>
            <p className="text-body-lg leading-tight md:leading-body-lg">
              <strong>{dictionary.slogan}</strong>
            </p>
          </hgroup>
          <div className="flex flex-col gap-spacious">
            <p className="text-body-r-sm leading-body-r-sm">
              {dictionary.description1}
            </p>
            <p className="text-body-r-sm leading-body-r-sm">
              {dictionary.description2}
            </p>
            <p className="text-body-r-sm leading-body-r-sm">
              {dictionary.description3}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
