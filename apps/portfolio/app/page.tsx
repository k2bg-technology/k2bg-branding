import { Hero } from "./components/contents/Hero";
import { Background } from "./components/contents/Background";
import { Skill } from "./components/contents/Skill";
import { Portfolio } from "./components/contents/Portfolio";
import { Contact } from "./components/contents/Contact";

import { Footer } from "./components/footer/Footer";

export default function Page() {
  return (
    <div className="grid absolute top-1/2 auto-rows-min gap-2 -translate-y-1/2 px-32">
      <main>
        <div className="grid grid-flow-col auto-cols-max max-h-[60rem] overflow-hidden">
          <Hero />
          <Background />
          <Skill />
          <Portfolio />
          <Contact />
        </div>
      </main>
      <Footer />
    </div>
  );
}
