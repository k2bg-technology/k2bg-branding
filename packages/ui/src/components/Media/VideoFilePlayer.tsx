interface BaseProps
  /** https://developer.mozilla.org/ja/docs/Web/HTML/Element/video */
  extends React.ComponentPropsWithoutRef<'video'> {
  file: string;
  width: number;
  height: number;
}

interface CaptionedProps extends BaseProps {
  // A captions track without a label has no accessible name in the captions menu.
  captionsSource: string;
  name: string;
}

interface UncaptionedProps extends BaseProps {
  captionsSource?: undefined;
  name?: string;
}

type Props = CaptionedProps | UncaptionedProps;

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
