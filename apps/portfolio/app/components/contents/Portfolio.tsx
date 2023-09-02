import Image from 'next/image';
import { Button, ExternalLinkButton, Dialog } from 'ui';

import { PORTFOLIO_DATA } from '../../data/portfolio-data';

interface DocumentProps {
  title: string;
  techStack: string;
  overview: string;
  backgroundImage: string;
  siteLink?: { buttonText: string; url: string }[];
  preview?: { buttonText: string; onClick?: () => void; video?: string };
}

function Document(props: DocumentProps) {
  const { title, techStack, overview, backgroundImage, siteLink, preview } =
    props;

  return (
    <div className="flex relative flex-col gap-5 p-20 w-[60rem] h-full">
      <div className="absolute top-0 left-0 -z-10 w-full h-full">
        <Image
          src={backgroundImage}
          fill
          alt="Stock Image"
          className="object-cover brightness-50"
        />
      </div>
      <h3 className="text-heading-3 leading-heading-3 font-bold">{title}</h3>
      <h4 className="text-heading-4 leading-heading-4 font-bold">使用技術</h4>
      <p className="text-body-sm leading-body-sm whitespace-pre-line">
        {techStack}
      </p>
      <h4 className="text-heading-4 leading-heading-4 font-bold">概要</h4>
      <p className="text-body-sm leading-body-sm  whitespace-pre-line">
        {overview}
      </p>
      <Dialog
        trigger={<Button>{preview?.buttonText}</Button>}
        content={
          <div className="flex justify-center items-center w-full h-full">
            <video
              controls
              muted
              autoPlay
              className="max-h-full object-contain aspect-video"
            >
              <source src={preview?.video} type="video/mp4" />
              <p>Your browser support HTML5 video.</p>
            </video>
          </div>
        }
      />
      {siteLink?.map((site) => (
        <ExternalLinkButton key={site.url} href={site.url} target="_blank">
          {site.buttonText}
        </ExternalLinkButton>
      ))}
    </div>
  );
}

export function Portfolio() {
  return (
    <section>
      <div className="flex h-[60rem]">
        <div className="flex flex-col justify-center gap-5 p-20 w-[45rem]">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            ポートフォリオ
          </h2>
          <div className="flex flex-col justify-center gap-5">
            <p className="text-body-sm leading-body-sm">
              具体的なアプリケーション開発事例を紹介致します。
            </p>
            <p className="text-body-sm leading-body-sm">
              業務で開発したものは守秘義務の観点から掲載できませんので、個人開発にて開発したものを中心に載せております。
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 text-white">
          {PORTFOLIO_DATA.map(({ key, ...rest }) => (
            <article key={key}>
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <Document {...rest} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
