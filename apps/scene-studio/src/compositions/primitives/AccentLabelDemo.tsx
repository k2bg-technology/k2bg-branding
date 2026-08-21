import { AbsoluteFill } from 'remotion';
import { SafeArea } from '../../primitives';
import { AccentLabel } from '../../primitives/AccentLabel';

export function AccentLabelDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <SafeArea className="flex flex-col items-start justify-center gap-16">
        <AccentLabel text="Block" />
        <AccentLabel
          text="Underline"
          variant="underline"
          tone="main"
          enterDelayInFrames={15}
        />
        <AccentLabel
          text="Side bar"
          variant="sideBar"
          enterDelayInFrames={30}
        />
      </SafeArea>
    </AbsoluteFill>
  );
}
