import { IframeHTMLAttributes as IframeHTMLAttributesOrigin } from 'react';

declare module 'react' {
  interface IframeHTMLAttributes<T> extends React.HTMLAttributes<T> {
    title?: string;
  }
}

interface Props
  /** https://developer.mozilla.org/ja/docs/Web/HTML/Element/iframe */
  extends IframeHTMLAttributesOrigin<HTMLIFrameElement> {
  url: string;
  width: number | '100%';
  height: number | '100%';
  name?: string;
}

export default function MusicStreamingPlayer({
  url,
  width,
  height,
  name,
  ...rest
}: Props) {
  return (
    <iframe {...rest} src={url} width={width} height={height} title={name} />
  );
}
