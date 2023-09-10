import { Suspense } from 'react';

import { languages, fallbackLng, Language } from '../i18n/settings';
import { useTranslation } from '../i18n';
import { Hero } from '../components/contents/Hero';
import { Background } from '../components/contents/Background';
import { Skill } from '../components/contents/Skill';
import { Portfolio } from '../components/contents/Portfolio';
import { Contact } from '../components/contents/Contact';
import { Footer } from '../components/footer/Footer';
import { LanguageSelector } from '../components/LanguageSelector';

import Loading from './loading';

export default async function Page({
  params: { lng },
}: {
  params: { lng: Language };
}) {
  const { t } = await useTranslation(
    languages.indexOf(lng) < 0 ? fallbackLng : lng
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="md:absolute md:top-1/2 md:-translate-y-1/2 md:px-32 md:animate-slide">
        <main>
          <div className="grid grid-flow-row auto-cols-fr overflow-hidden md:grid-flow-col md:auto-cols-max md:rounded-3xl md:shadow-2xl md:max-h-[60rem]">
            <Hero lng={lng} />
            <Background t={t} />
            <Skill t={t} />
            <Portfolio t={t} />
            <Contact t={t} />
          </div>
        </main>
        <Footer lng={lng} />
      </div>
      <LanguageSelector />
    </Suspense>
  );
}
