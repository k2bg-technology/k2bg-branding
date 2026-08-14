import { AbsoluteFill } from 'remotion';
import { EdgeBlur } from '../../primitives';

export function EdgeBlurDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent 0 48px, rgba(255, 255, 255, 0.6) 48px 64px), repeating-linear-gradient(90deg, transparent 0 48px, rgba(255, 255, 255, 0.6) 48px 64px)',
        }}
      />
      <EdgeBlur />
    </AbsoluteFill>
  );
}
