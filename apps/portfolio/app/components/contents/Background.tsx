import Image from 'next/image';
import { TFunction } from 'i18next';

export function Background({ t }: { t: TFunction }) {
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
          <h2 className="text-header-2 leading-header-2 font-bold">
            {t('background.background')}
          </h2>
          <div className="flex flex-col gap-normal">
            <p className="text-body-r-sm leading-body-r-sm">
              {t('background.description1')}
            </p>
            <p className="text-body-r-sm leading-body-r-sm">
              {t('background.description2')}
            </p>
            <p className="text-body-r-sm leading-body-r-sm">
              {t('background.description3')}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-normal">
          <h2 className="text-header-2 leading-header-2 font-bold">
            {t('background.certification')}
          </h2>
          <ul className="text-body-r-sm leading-body-r-sm">
            <li>{t('background.certification1')}</li>
            <li>{t('background.certification2')}</li>
            <li>{t('background.certification3')}</li>
            <li>{t('background.certification4')}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
