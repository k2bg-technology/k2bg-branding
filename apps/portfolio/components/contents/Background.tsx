import Image from 'next/image';
import type { Dictionary } from '../../i18n/dictionaries';

type BackgroundDictionary = Dictionary['background'];

export function Background({
  dictionary,
}: {
  dictionary: BackgroundDictionary;
}) {
  return (
    <section>
      <div className="flex flex-col gap-spacious relative p-6 w-full text-white md:p-12 md:w-[56rem] md:h-[37.5rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image
            src="/images/background-pattern.jpg"
            fill
            alt="Background Pattern Image"
          />
        </div>
        <div className="flex flex-col gap-normal">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            {dictionary.background}
          </h2>
          <div className="flex flex-col gap-normal">
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
        <div className="flex flex-col gap-normal">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            {dictionary.certification}
          </h2>
          <ul className="text-body-r-sm leading-body-r-sm">
            <li>{dictionary.certification1}</li>
            <li>{dictionary.certification2}</li>
            <li>{dictionary.certification3}</li>
            <li>{dictionary.certification4}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
