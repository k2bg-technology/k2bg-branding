import Image from 'next/image';
import { TFunction } from 'i18next';
import { Icon } from 'ui';

export function Skill({ t }: { t: TFunction }) {
  return (
    <section>
      <div className="relative p-6 w-full md:p-12 md:w-[68rem] md:h-[37.5rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image
            src="/images/skill-pattern.jpg"
            fill
            alt="Skill Pattern Image"
          />
        </div>
        <div className="flex flex-col gap-spacious h-full md:flex-row md:gap-0">
          <div className="flex flex-col gap-spacious w-full">
            <h2 className="text-header-2 leading-header-2 font-bold">
              {t('skill.skill')}
            </h2>
            <div className="flex flex-col gap-condensed">
              <h3 className="text-header-3 leading-header-3 font-bold">
                {t('skill.programming')}
              </h3>
              <p className="text-body-r-sm leading-body-r-sm">
                {t('skill.programmingStack')}
              </p>
            </div>
            <div className="flex flex-col gap-condensed">
              <h3 className="text-header-3 leading-header-3 font-bold">
                {t('skill.uiux')}
              </h3>
              <p className="text-body-r-sm leading-body-r-sm">
                {t('skill.uiuxStack')}
              </p>
            </div>
            <div className="flex flex-col gap-condensed">
              <h3 className="text-header-3 leading-header-3 font-bold">
                {t('skill.dataAnalysis')}
              </h3>
              <p className="text-body-r-sm leading-body-r-sm">
                {t('skill.dataAnalysisStack')}
              </p>
            </div>
            <div className="flex flex-col gap-condensed">
              <h3 className="text-header-3 leading-header-3 font-bold">
                {t('skill.cloud')}
              </h3>
              <p className="text-body-r-sm leading-body-r-sm">
                {t('skill.cloudStack')}
              </p>
            </div>
          </div>
          <div className="p-normal w-full h-full md:p-spacious">
            <ul className="grid grid-cols-3 gap-y-spacious h-full md:gap-y-0">
              <li className="flex justify-center items-center">
                <Icon name="typescript" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="python" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="golang" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="react" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="figma" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="wordpress" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="jupyter" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="tensorflow" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="aws" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon
                  name="google-cloud"
                  originalColor
                  width={50}
                  height={50}
                />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="docker" originalColor width={50} height={50} />
              </li>
              <li className="flex justify-center items-center">
                <Icon name="circleci" originalColor width={50} height={50} />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
