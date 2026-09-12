interface BaseProps
  /** https://developer.mozilla.org/ja/docs/Web/HTML/Element/img */
  extends React.ComponentPropsWithoutRef<'img'> {
  url?: string;
  file?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
}

interface LinkedProps extends BaseProps {
  // A link whose only content is a decorative image has no accessible name.
  linkUrl: string;
  name: string;
}

interface UnlinkedProps extends BaseProps {
  linkUrl?: undefined;
  name?: string;
}

type Props = LinkedProps | UnlinkedProps;

export function ImageViewer({
  id,
  name,
  linkUrl,
  url,
  file,
  width,
  height,
  unoptimized,
  ...rest
}: Props) {
  if (linkUrl)
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener nofollow"
        className="inline-block"
      >
        <img
          {...rest}
          alt={name}
          src={file || url}
          width={width}
          height={height}
          data-id={id}
          data-unoptimized={unoptimized}
        />
      </a>
    );

  return (
    <img
      {...rest}
      alt={name ?? ''}
      src={file || url}
      width={width}
      height={height}
      data-id={id}
      data-unoptimized={unoptimized}
    />
  );
}
