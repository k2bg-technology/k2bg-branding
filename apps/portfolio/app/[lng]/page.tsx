import { Suspense } from 'react';

import { languages, fallbackLng, Language } from '../../i18n/settings';
import { getTranslation } from '../../i18n';
import { Hero } from '../../components/contents/Hero';
import { Background } from '../../components/contents/Background';
import { Skill } from '../../components/contents/Skill';
import { Portfolio } from '../../components/contents/Portfolio';
import { Contact } from '../../components/contents/Contact';
import { Footer } from '../../components/footer/Footer';
import { LanguageSelector } from '../../components/LanguageSelector';
import { ScrollHelper } from '../../components/ScrollHelper';
import { Slider } from '../../components/Slider';

import Loading from './loading';

export default async function Page({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const language = (languages as readonly string[]).includes(lng)
    ? (lng as Language)
    : fallbackLng;
  const { t } = await getTranslation(language);

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col gap-condensed md:absolute md:top-1/2 md:-translate-y-1/2 md:px-20">
        <main>
          <Slider>
            <div className="grid grid-flow-row auto-cols-fr overflow-hidden md:grid-flow-col md:auto-cols-max md:rounded-3xl md:shadow-2xl md:max-h-[37.5rem]">
              <Hero lng={language} />
              <Background t={t} />
              <Skill t={t} />
              <Portfolio t={t} />
              <Contact t={t} />
            </div>
          </Slider>
        </main>
        <Footer lng={language} />
      </div>
      <LanguageSelector />
      <ScrollHelper />
    </Suspense>
  );
}
