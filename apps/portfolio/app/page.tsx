import { Suspense } from 'react';

import { Hero } from './components/contents/Hero';
import { Background } from './components/contents/Background';
import { Skill } from './components/contents/Skill';
import { Portfolio } from './components/contents/Portfolio';
import { Contact } from './components/contents/Contact';
import { Footer } from './components/footer/Footer';
import Loading from './loading';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="md:absolute md:top-1/2 md:-translate-y-1/2 md:px-32">
        <main>
          <div className="grid grid-flow-row auto-cols-fr overflow-hidden md:grid-flow-col md:auto-cols-max md:rounded-3xl md:shadow-2xl md:max-h-[60rem]">
            <Hero />
            <Background />
            <Skill />
            <Portfolio />
            <Contact />
          </div>
        </main>
        <Footer />
      </div>
    </Suspense>
  );
}
