import { AbsoluteFill } from 'remotion';
import { Caption, SafeArea } from '../../primitives';

export function CaptionDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <SafeArea className="flex flex-col justify-end gap-8">
        <Caption text="Enters at frame 0 and stays" />
        <Caption
          text="Enters at frame 30, exits at frame 110"
          enterDelayInFrames={30}
          exitAtFrame={110}
        />
      </SafeArea>
    </AbsoluteFill>
  );
}
