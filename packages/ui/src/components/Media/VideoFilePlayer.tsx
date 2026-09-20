interface Props
  /** https://developer.mozilla.org/ja/docs/Web/HTML/Element/video */
  extends React.ComponentPropsWithoutRef<'video'> {
  file: string;
  width: number;
  height: number;
  name?: string;
  captionsSource?: string;
}

export function VideoFilePlayer({
  width,
  height,
  file,
  name,
  captionsSource,
  ...rest
}: Props) {
  return (
    <video {...rest} width={width} height={height}>
      <source src={file} type="video/mp4" />
      {captionsSource && (
        <track kind="captions" src={captionsSource} label={name} />
      )}
    </video>
  );
}
