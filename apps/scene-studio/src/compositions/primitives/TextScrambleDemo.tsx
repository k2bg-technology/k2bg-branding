import { AbsoluteFill } from 'remotion';
import { SafeArea } from '../../primitives';
import { TextScramble } from '../../primitives/TextScramble';

export function TextScrambleDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <SafeArea className="flex flex-col justify-center gap-16">
        <TextScramble text="SCENE STUDIO" className="text-scene-subtitle" />
        <TextScramble
          text="SECOND SEED"
          enterDelayInFrames={40}
          seed={5}
          className="text-scene-caption"
        />
      </SafeArea>
    </AbsoluteFill>
  );
}
