import { AbsoluteFill, Series } from 'remotion';

import { brandDemoScenes, SCENE_DURATION_IN_FRAMES } from './scenes';

export function BrandDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <Series>
        {brandDemoScenes.map((scene) => (
          <Series.Sequence
            key={scene.name}
            durationInFrames={SCENE_DURATION_IN_FRAMES}
          >
            <scene.component />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
}
