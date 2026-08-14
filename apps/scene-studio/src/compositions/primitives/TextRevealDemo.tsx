import { AbsoluteFill } from 'remotion';
import { SafeArea } from '../../primitives';
import { TextReveal } from '../../primitives/TextReveal';

export function TextRevealDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <SafeArea className="flex flex-col justify-center gap-16">
        <TextReveal text="Morning Light" className="text-scene-title" />
        <TextReveal
          text="One word at a time"
          splitBy="word"
          enterDelayInFrames={40}
          className="text-scene-caption"
        />
      </SafeArea>
    </AbsoluteFill>
  );
}
