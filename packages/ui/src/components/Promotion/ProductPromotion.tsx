interface Provider {
  linkText: string;
  linkUrl: string;
  color: string;
}

interface ProductPromotionProps {
  linkText: string;
  linkUrl: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  providers?: Provider[];
}

export default function ProductPromotion(props: ProductPromotionProps) {
  const { linkText, linkUrl, imageUrl, imageWidth, imageHeight, providers } =
    props;

  return (
    <div className="flex gap-6 p-8 border-solid border-4 border-base-white">
      <a href={linkUrl} target="_blank" rel="noopener nofollow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={linkText}
          src={imageUrl}
          onClick={() => linkUrl && window.open(linkUrl, '_blank')}
          width={imageWidth}
          height={imageHeight}
          className="object-contain object-top cursor-pointer w-[120px] max-h-[160px]"
          aria-hidden="true"
        />
      </a>
      <div className="flex flex-col gap-5 w-full">
        <div>
          <a
            href={linkUrl}
            target="_blank"
            className="text-body-r-md leading-body-r-md text-base-black/80 text-justify underline hover:opacity-80"
          >
            {linkText}
          </a>
        </div>
        <ul className="flex gap-5 list-none">
          {providers?.map((provider) => (
            <li key={provider.linkText}>
              <a
                href={provider.linkUrl}
                target="_blank"
                rel="noopener nofollow"
                className="inline-block transition-all rounded-md cursor-pointer px-4 py-4 text-body-r-sm text-center font-bold leading-none text-white hover:opacity-80"
                style={{ backgroundColor: provider.color }}
              >
                {provider.linkText}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
