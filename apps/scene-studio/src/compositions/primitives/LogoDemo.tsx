import { AbsoluteFill } from 'remotion';
import { Logo, SafeArea } from '../../primitives';

export function LogoDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <SafeArea showGuides>
        <Logo corner="top-left" />
        <Logo corner="top-right" />
        <Logo corner="bottom-left" opacity={0.5} />
        <Logo corner="bottom-right" opacity={0.5} />
      </SafeArea>
    </AbsoluteFill>
  );
}
