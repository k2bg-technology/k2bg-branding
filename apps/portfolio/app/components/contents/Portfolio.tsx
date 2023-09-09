import Image from 'next/image';
import { Button, ExternalLinkButton, Dialog } from 'ui';
import { TFunction } from 'i18next';
import { ReactNode } from 'react';

interface DocumentProps {
  title: string;
  subtitle1: string;
  subtitle2: string;
  techStack: string;
  overview: string;
  backgroundImage: string;
  preview: ReactNode;
  previewVideo: string;
  siteLink?: ReactNode;
}

function Document(props: DocumentProps) {
  const {
    title,
    subtitle1,
    subtitle2,
    techStack,
    overview,
    backgroundImage,
    siteLink,
    preview,
    previewVideo,
  } = props;

  return (
    <div className="flex relative flex-col gap-5 p-10 w-full h-full md:p-20 md:w-[60rem]">
      <div className="absolute top-0 left-0 -z-10 w-full h-full">
        <Image
          src={backgroundImage}
          fill
          alt="Stock Image"
          className="object-cover brightness-50"
        />
      </div>
      <h3 className="text-heading-3 leading-heading-3 font-bold">{title}</h3>
      <h4 className="text-heading-4 leading-heading-4 font-bold">
        {subtitle1}
      </h4>
      <p className="text-body-sm leading-body-sm whitespace-pre-line">
        {techStack}
      </p>
      <h4 className="text-heading-4 leading-heading-4 font-bold">
        {subtitle2}
      </h4>
      <p className="text-body-sm leading-body-sm whitespace-pre-line">
        {overview}
      </p>
      <Dialog
        trigger={preview}
        content={
          <div className="flex justify-center items-center w-full h-full">
            <video
              controls
              muted
              autoPlay
              className="max-h-full object-contain aspect-video"
            >
              <source src={previewVideo} type="video/mp4" />
              <p>Your browser support HTML5 video.</p>
            </video>
          </div>
        }
      />
      {siteLink}
    </div>
  );
}

export function Portfolio({ t }: { t: TFunction }) {
  return (
    <section>
      <div className="flex flex-col md:flex-row md:h-[60rem]">
        <div className="flex flex-col justify-center gap-5 p-10 w-full md:p-20 md:w-[45rem]">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            {t('portfolio.portfolio')}
          </h2>
          <div className="flex flex-col justify-center gap-5">
            <p className="text-body-sm leading-body-sm">
              {t('portfolio.description1')}
            </p>
            <p className="text-body-sm leading-body-sm">
              {t('portfolio.description2')}
            </p>
          </div>
        </div>
        <div className="grid text-white md:grid-cols-4">
          <article>
            <Document
              title={t('portfolio.webApp.title')}
              subtitle1={t('portfolio.techStack')}
              subtitle2={t('portfolio.overview')}
              techStack={t('portfolio.webApp.techStack')}
              overview={t('portfolio.webApp.overview')}
              backgroundImage="/images/stock.jpg"
              preview={<Button>{t('portfolio.preview')}</Button>}
              previewVideo="/videos/stock-app.mp4"
              siteLink={
                <>
                  <ExternalLinkButton
                    href="https://github.com/stranger1989/trading-dashboard"
                    target="_blank"
                  >
                    {t('portfolio.githubApp')}
                  </ExternalLinkButton>
                  <ExternalLinkButton
                    href="https://github.com/stranger1989/ml-playground-api"
                    target="_blank"
                  >
                    {t('portfolio.githubApi')}
                  </ExternalLinkButton>
                </>
              }
            />
          </article>
          <article>
            <Document
              title={t('portfolio.mobileApp.title')}
              subtitle1={t('portfolio.techStack')}
              subtitle2={t('portfolio.overview')}
              techStack={t('portfolio.mobileApp.techStack')}
              overview={t('portfolio.mobileApp.overview')}
              backgroundImage="/images/mobile.jpg"
              preview={<Button>{t('portfolio.preview')}</Button>}
              previewVideo="/videos/mobile.mp4"
              siteLink={
                <>
                  <ExternalLinkButton
                    href="https://github.com/stranger1989/merchandise_control_system_native_app"
                    target="_blank"
                  >
                    {t('portfolio.githubApp')}
                  </ExternalLinkButton>
                  <ExternalLinkButton
                    href="https://github.com/stranger1989/merchandise_control_system"
                    target="_blank"
                  >
                    {t('portfolio.githubApi')}
                  </ExternalLinkButton>
                </>
              }
            />
          </article>
          <article>
            <Document
              title={t('portfolio.scrapingApp.title')}
              subtitle1={t('portfolio.techStack')}
              subtitle2={t('portfolio.overview')}
              techStack={t('portfolio.scrapingApp.techStack')}
              overview={t('portfolio.scrapingApp.overview')}
              backgroundImage="/images/web.jpg"
              preview={<Button>{t('portfolio.preview')}</Button>}
              previewVideo="/videos/scrapy.mp4"
              siteLink={
                <ExternalLinkButton
                  href="https://github.com/stranger1989/scrapy_snippets"
                  target="_blank"
                >
                  {t('portfolio.github')}
                </ExternalLinkButton>
              }
            />
          </article>
          <article>
            <Document
              title={t('portfolio.blogApp.title')}
              subtitle1={t('portfolio.techStack')}
              subtitle2={t('portfolio.overview')}
              techStack={t('portfolio.blogApp.techStack')}
              overview={t('portfolio.blogApp.overview')}
              backgroundImage="/images/blog.jpg"
              preview={<Button>{t('portfolio.preview')}</Button>}
              previewVideo="/videos/blank.mp4"
              siteLink={
                <>
                  <ExternalLinkButton
                    href="https://blank-oldstranger.com/"
                    target="_blank"
                  >
                    {t('portfolio.siteURL')}
                  </ExternalLinkButton>
                  <ExternalLinkButton
                    href="https://github.com/stranger1989/wordpress-local-dev-template"
                    target="_blank"
                  >
                    {t('portfolio.github')}
                  </ExternalLinkButton>
                </>
              }
            />
          </article>
        </div>
      </div>
    </section>
  );
}
