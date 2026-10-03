import { AbsoluteFill } from 'remotion';
import { SafeArea, VideoTitle } from '../../primitives';

export function VideoTitleDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <SafeArea className="flex flex-col justify-center gap-16">
        <VideoTitle title="Morning Light" />
        <VideoTitle title="Morning Light" tone="main" enterDelayInFrames={15} />
        <VideoTitle
          title="Morning Light"
          tone="accent"
          enterDelayInFrames={30}
        />
      </SafeArea>
    </AbsoluteFill>
  );
}
