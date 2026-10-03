import { AbsoluteFill } from 'remotion';
import { Caption, SafeArea } from '../../primitives';

export function SafeAreaDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(160deg, rgba(184, 210, 0, 0.35), rgba(248, 181, 0, 0.35))',
        }}
      />
      <SafeArea showGuides className="flex flex-col justify-end">
        <Caption text="Captions and CTAs stay inside the guides" />
      </SafeArea>
    </AbsoluteFill>
  );
}
