import { HTMLAttributes } from 'react';

import { Button } from '../Button';

interface Provider {
  linkText: string;
  linkUrl: string;
  color: string;
}

interface ProductPromotionProps extends HTMLAttributes<HTMLDivElement> {
  linkText: string;
  linkUrl: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  providers?: Provider[];
  imagePlaceholder?: string;
}

export default function ProductPromotion(props: ProductPromotionProps) {
  const {
    linkText,
    linkUrl,
    imageUrl,
    imageWidth,
    imageHeight,
    providers,
    imagePlaceholder,
    ...rest
  } = props;

  return (
    <div
      {...rest}
      className="flex gap-spacious p-spacious border-solid border-4 border-base-white"
    >
      <a href={linkUrl} target="_blank" rel="noopener nofollow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={linkText}
          src={imageUrl}
          onClick={() => linkUrl && window.open(linkUrl, '_blank')}
          width={imageWidth}
          height={imageHeight}
          data-placeholder={imagePlaceholder}
          className="object-contain object-top cursor-pointer w-[120px] max-h-[160px]"
          aria-hidden="true"
        />
      </a>
      <div className="flex flex-col gap-spacious w-full">
        <div>
          <a
            href={linkUrl}
            target="_blank"
            className="text-body-r-md leading-body-r-md text-base-black/80 text-justify underline hover:opacity-80"
          >
            {linkText}
          </a>
        </div>
        <ul className="flex gap-normal list-none">
          {providers?.map((provider) => (
            <li key={provider.linkText}>
              <Button asChild style={{ backgroundColor: provider.color }}>
                <a
                  href={provider.linkUrl}
                  target="_blank"
                  rel="noopener nofollow"
                >
                  {provider.linkText}
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
