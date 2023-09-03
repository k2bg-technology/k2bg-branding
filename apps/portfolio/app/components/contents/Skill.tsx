import Image from 'next/image';
import { SvgIcon } from 'ui';

export function Skill() {
  return (
    <section>
      <div className="relative p-10 w-full md:p-20 md:w-[110rem] md:h-[60rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image src="/skill-pattern.jpg" fill alt="Skill Pattern Image" />
        </div>
        <div className="flex flex-col gap-10 h-full md:flex-row md:gap-0">
          <div className="flex flex-col gap-10 w-full">
            <h2 className="text-heading-2 leading-heading-2 font-bold">
              スキル
            </h2>
            <div>
              <h3 className="text-heading-3 leading-heading-3 font-bold">
                プログラミング・フレームワーク
              </h3>
              <p className="text-body-sm leading-body-sm">
                Nodejs（Javascript、Typescript）、React(ReactNative）、Python、FastAPI、Scrapy、Golang、Wordpress
              </p>
            </div>
            <div>
              <h3 className="text-heading-3 leading-heading-3 font-bold">
                UI・UX
              </h3>
              <p className="text-body-sm leading-body-sm">
                HTML、CSS（SASS）、Figma、Photoshop、Illustrator、Indesign
              </p>
            </div>
            <div>
              <h3 className="text-heading-3 leading-heading-3 font-bold">
                データ分析
              </h3>
              <p className="text-body-sm leading-body-sm">
                Google Analytics、Google Tag Manager、Google Colab、Google
                Looker Studio、Bigquery、Tableau、Datadog
              </p>
            </div>
            <div>
              <h3 className="text-heading-3 leading-heading-3 font-bold">
                クラウド・DevOps
              </h3>
              <p className="text-body-sm leading-body-sm">
                Git・Github、AWS、GCP、Docker、CircleCI、Github Actions
              </p>
            </div>
          </div>
          <div className="p-5 w-full h-full md:p-10">
            <ul className="grid grid-cols-3 gap-y-10 h-full md:gap-y-0">
              <li className="flex justify-center items-center">
                <SvgIcon name="typescript" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="python" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="golang" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="react" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="figma" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="wordpress" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="jupyter" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="tensorflow" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="aws" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="googleCloud" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="docker" className="w-20 h-20" />
              </li>
              <li className="flex justify-center items-center">
                <SvgIcon name="circleci" className="w-20 h-20" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
