import Image from 'next/image';
import { SvgIcon } from 'ui';
import { TFunction } from 'i18next';

export function Skill({ t }: { t: TFunction }) {
  return (
    <section>
      <div className="relative p-10 w-full md:p-20 md:w-[110rem] md:h-[60rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image
            src="/images/skill-pattern.jpg"
            fill
            alt="Skill Pattern Image"
          />
        </div>
        <div className="flex flex-col gap-10 h-full md:flex-row md:gap-0">
          <div className="flex flex-col gap-10 w-full">
            <h2 className="text-header-2 leading-header-2 font-bold">
              {t('skill.skill')}
            </h2>
            <div>
              <h3 className="text-header-3 leading-header-3 font-bold">
                {t('skill.programming')}
              </h3>
              <p className="text-body-r-sm leading-body-r-sm">
                {t('skill.programmingStack')}
              </p>
            </div>
            <div>
              <h3 className="text-header-3 leading-header-3 font-bold">
                {t('skill.uiux')}
              </h3>
              <p className="text-body-r-sm leading-body-r-sm">
                {t('skill.uiuxStack')}
              </p>
            </div>
            <div>
              <h3 className="text-header-3 leading-header-3 font-bold">
                {t('skill.dataAnalysis')}
              </h3>
              <p className="text-body-r-sm leading-body-r-sm">
                {t('skill.dataAnalysisStack')}
              </p>
            </div>
            <div>
              <h3 className="text-header-3 leading-header-3 font-bold">
                {t('skill.cloud')}
              </h3>
              <p className="text-body-r-sm leading-body-r-sm">
                {t('skill.cloudStack')}
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
