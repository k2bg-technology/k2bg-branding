import { AbsoluteFill } from 'remotion';
import { Caption, GradientOverlay, SafeArea } from '../../primitives';

export function GradientOverlayDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(20deg, #b8d200 0%, #f8b500 50%, #f3f3f2 100%)',
        }}
      />
      <GradientOverlay maxOpacity={0.8} />
      <SafeArea className="flex flex-col justify-end">
        <Caption text="The bottom gradient keeps this caption readable" />
      </SafeArea>
    </AbsoluteFill>
  );
}
