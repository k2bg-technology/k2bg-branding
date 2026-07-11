import { AbsoluteFill, Series } from 'remotion';

import { TitleScene } from './TitleScene';
import { TokenScene } from './TokenScene';
import { TypographyScene } from './TypographyScene';

const SCENE_DURATION_IN_FRAMES = 150;

export function BrandDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATION_IN_FRAMES}>
          <TitleScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION_IN_FRAMES}>
          <TokenScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION_IN_FRAMES}>
          <TypographyScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
}
