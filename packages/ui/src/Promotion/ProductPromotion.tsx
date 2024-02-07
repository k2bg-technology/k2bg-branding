interface Provider {
  linkText: string;
  linkUrl: string;
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
    <div className="flex gap-5 p-8 border-solid border-4 border-base-white">
      <a href={linkUrl} target="_blank" rel="noopener nofollow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={linkText}
          src={imageUrl}
          onClick={() => linkUrl && window.open(linkUrl, '_blank')}
          width={imageWidth}
          height={imageHeight}
          className="object-contain cursor-pointer"
          aria-hidden="true"
        />
      </a>
      <div className="flex flex-col gap-5 w-full">
        <div>
          <a
            href={linkUrl}
            target="_blank"
            className="text-body-md leading-body-md text-base-black/80 text-justify"
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
                className="inline-block transition-all rounded-md cursor-pointer px-4 py-4 text-body-sm text-center font-bold leading-none bg-main text-white hover:bg-opacity-90"
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
