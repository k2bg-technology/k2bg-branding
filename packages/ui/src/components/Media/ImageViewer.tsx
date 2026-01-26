interface Props
  /** https://developer.mozilla.org/ja/docs/Web/HTML/Element/img */
  extends React.ComponentPropsWithoutRef<'img'> {
  name?: string;
  linkUrl?: string;
  url?: string;
  file?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
}

export default function ImageViewer({
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
      alt={name}
      src={file || url}
      width={width}
      height={height}
      data-id={id}
      data-unoptimized={unoptimized}
    />
  );
}
