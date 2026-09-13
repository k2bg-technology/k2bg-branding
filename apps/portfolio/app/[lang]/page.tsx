import { Suspense } from 'react';
import { Background } from '../../components/contents/Background';
import { Contact } from '../../components/contents/Contact';
import { Hero } from '../../components/contents/Hero';
import { Portfolio } from '../../components/contents/Portfolio';
import { Skill } from '../../components/contents/Skill';
import { Footer } from '../../components/footer/Footer';
import { LanguageSelector } from '../../components/LanguageSelector';
import { PortfolioLoading } from '../../components/PortfolioLoading';
import { ScrollHelper } from '../../components/ScrollHelper';
import { Slider } from '../../components/Slider';
import { getDictionary } from '../../i18n/dictionaries';
import { resolveLanguage } from '../../i18n/settings';

type PageProps = {
  params: Promise<{ lang: string }>;
};

/**
 * Stays synchronous so the fallback streams before the dictionary resolves;
 * a route-level `loading.tsx` would do the same, but it also wraps the
 * catch-all segment and turns its `notFound()` into a streamed 200.
 */
export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<PortfolioLoading />}>
      <PortfolioPageContent params={params} />
    </Suspense>
  );
}

async function PortfolioPageContent({ params }: PageProps) {
  const { lang } = await params;
  const language = resolveLanguage(lang);
  const dictionary = await getDictionary(language);

  return (
    <>
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
      <ScrollHelper dictionary={dictionary.scrollHelper} />
    </>
  );
}
