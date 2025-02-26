interface Props
  /** https://developer.mozilla.org/ja/docs/Web/HTML/Element/video */
  extends React.ComponentPropsWithoutRef<'video'> {
  file: string;
  width: number;
  height: number;
  name?: string;
}

export default function VideoFilePlayer({
  width,
  height,
  file,
  name,
  ...rest
}: Props) {
  return (
    <video {...rest} width={width} height={height}>
      <source src={file} type="video/mp4" />
      <track kind="captions" label={name} />
    </video>
  );
}
