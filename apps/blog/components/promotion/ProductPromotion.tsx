import { Button } from 'ui';

interface Provider {
  linkText: string;
  linkUrl: string;
  color: string;
}

interface ProductPromotionProps extends React.ComponentPropsWithoutRef<'div'> {
  linkText: string;
  linkUrl: string;
  image: React.ReactNode;
  providers?: Provider[];
  imagePlaceholder?: string;
}

export default function ProductPromotion(props: ProductPromotionProps) {
  const { linkText, linkUrl, image, providers, ...rest } = props;

  return (
    <div
      {...rest}
      className="flex gap-spacious p-spacious border-solid border-4 border-base-white"
    >
      <a href={linkUrl} target="_blank" rel="noopener nofollow">
        {image}
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
