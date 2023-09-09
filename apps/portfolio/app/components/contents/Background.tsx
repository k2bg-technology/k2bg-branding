import Image from 'next/image';
import { TFunction } from 'i18next';

export function Background({ t }: { t: TFunction }) {
  return (
    <section>
      <div className="flex flex-col gap-10 relative p-10 w-full text-white md:p-20 md:w-[90rem] md:h-[60rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image
            src="/images/background-pattern.jpg"
            fill
            alt="Background Pattern Image"
          />
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            {t('background.background')}
          </h2>
          <div className="flex flex-col gap-5">
            <p className="text-body-sm leading-body-sm">
              {t('background.description1')}
            </p>
            <p className="text-body-sm leading-body-sm">
              {t('background.description2')}
            </p>
            <p className="text-body-sm leading-body-sm">
              {t('background.description3')}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            {t('background.certification')}
          </h2>
          <ul className="text-body-sm leading-body-sm">
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
