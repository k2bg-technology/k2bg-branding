declare module 'react' {
  interface IframeHTMLAttributes<T> extends React.HTMLAttributes<T> {
    title?: string;
  }
}

interface Props
  /** https://developer.mozilla.org/ja/docs/Web/HTML/Element/iframe */
  extends React.ComponentPropsWithoutRef<'iframe'> {
  url: string;
  width: number;
  height: number;
  name?: string;
}

export default function VideoStreamingPlayer({
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
