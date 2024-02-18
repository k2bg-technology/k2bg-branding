import { HTMLAttributes } from 'react';

interface Props
  /** https://developer.mozilla.org/ja/docs/Web/HTML/Element/img */
  extends HTMLAttributes<HTMLImageElement> {
  name?: string;
  linkUrl?: string;
  url?: string;
  file?: string;
  width?: number;
  height?: number;
}

export default function ImageViewer({
  name,
  linkUrl,
  url,
  file,
  width,
  height,
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...rest}
          alt={name}
          src={file || url}
          width={width}
          height={height}
        />
      </a>
    );

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...rest} alt={name} src={file || url} width={width} height={height} />
  );
}
