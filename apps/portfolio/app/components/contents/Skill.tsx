import React from "react";
import Image from "next/image";

import Icon from "../icon";

export function Skill() {
  return (
    <section>
      <div className="relative p-20 w-[90rem] h-[60rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image
            src="/skill-pattern.jpg"
            fill={true}
            alt="Skill Pattern Image"
          />
        </div>
        <div>
          <h2>スキル</h2>
          <h3>プログラミング・フレームワーク</h3>
          <p>
            Nodejs（Javascript、Typescript）、React(ReactNative）、Python、FastAPI、Scrapy、Golang、Wordpress
          </p>
          <h3>UI・UX</h3>
          <p>HTML、CSS（SASS）、Figma、Photoshop、Illustrator、Indesign</p>
          <h3>データ分析</h3>
          <p>
            Google Analytics、Google Tag Manager、Google Colab、Google Looker
            Studio、Bigquery、Tableau、Datadog
          </p>
          <h3>クラウド・DevOps</h3>
          <p>Git・Github、AWS、GCP、Docker、CircleCI、Github Actions</p>
        </div>
        <div>
          <ul>
            <li>
              <Icon name="typescript" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="python" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="golang" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="react" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="figma" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="wordpress" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="jupyter" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="tensorflow" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="aws" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="googleCloud" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="docker" className="w-20 h-20" />
            </li>
            <li>
              <Icon name="circleci" className="w-20 h-20" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
