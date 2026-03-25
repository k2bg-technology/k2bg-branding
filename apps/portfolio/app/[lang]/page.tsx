import { Suspense } from 'react';
import { Background } from '../../components/contents/Background';
import { Contact } from '../../components/contents/Contact';
import { Hero } from '../../components/contents/Hero';
import { Portfolio } from '../../components/contents/Portfolio';
import { Skill } from '../../components/contents/Skill';
import { Footer } from '../../components/footer/Footer';
import { LanguageSelector } from '../../components/LanguageSelector';
import { ScrollHelper } from '../../components/ScrollHelper';
import { Slider } from '../../components/Slider';
import { getDictionary } from '../../i18n/dictionaries';
import { resolveLanguage } from '../../i18n/settings';

import Loading from './loading';

type PageProps = {
  params: Promise<{ lang: string }>;
};

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const language = resolveLanguage(lang);
  const dictionary = await getDictionary(language);

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col gap-condensed md:absolute md:top-1/2 md:-translate-y-1/2 md:px-20">
        <main>
          <Slider className="contents md:block">
            <div className="grid grid-flow-row auto-cols-fr overflow-hidden md:grid-flow-col md:auto-cols-max md:rounded-3xl md:shadow-2xl md:max-h-[37.5rem]">
              <Hero dictionary={dictionary.hero} />
              <Background dictionary={dictionary.background} />
              <Skill dictionary={dictionary.skill} />
              <Portfolio dictionary={dictionary.portfolio} />
              <Contact dictionary={dictionary.contact} />
            </div>
          </Slider>
        </main>
        <Footer copyright={dictionary.footer.copyright} />
      </div>
      <LanguageSelector />
      <ScrollHelper />
    </Suspense>
  );
}
