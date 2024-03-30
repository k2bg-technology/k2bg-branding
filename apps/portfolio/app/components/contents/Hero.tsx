'use client';

import Image from 'next/image';
import { Trans } from 'react-i18next';

import { Language } from '../../i18n/settings';
import { useTranslation } from '../../i18n/client';

export function Hero({ lng }: { lng: Language }) {
  const { t } = useTranslation(lng);

  return (
    <section>
      <div className="grid grid-rows-[max(35rem)_1fr] grid-cols-full h-full md:grid-rows-1 md:grid-cols-[max(35rem)_max(80rem)]">
        <div className="relative">
          <Image
            src="/images/hero.jpg"
            fill
            alt="Hero Image"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-10 p-10 md:justify-center md:p-20">
          <hgroup className="flex flex-col gap-2 md:gap-0">
            <h1 className="text-header-1 leading-tight font-bold md:leading-header-1">
              {t('hero.corporateName')}
            </h1>
            <p className="text-body-r-md leading-body-r-md">
              {t('hero.officialName')}
            </p>
            <p className="text-body-lg leading-tight md:leading-body-lg">
              <strong>{t('hero.slogan')}</strong>
            </p>
          </hgroup>
          <div className="flex flex-col gap-5">
            <Trans i18nKey="hero.description">
              <p className="text-body-r-sm leading-body-r-sm">
                <span className="font-bold" />
              </p>
            </Trans>
          </div>
        </div>
      </div>
    </section>
  );
}
