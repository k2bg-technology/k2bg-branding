import { AbsoluteFill, Series } from 'remotion';

import { Caption, SafeArea } from '../../primitives';
import { SHADER_SCENE_DURATION_IN_FRAMES, shaderDemoScenes } from './scenes';

export function ShaderDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <Series>
        {shaderDemoScenes.map((scene) => (
          <Series.Sequence
            key={scene.name}
            durationInFrames={SHADER_SCENE_DURATION_IN_FRAMES}
          >
            <scene.component />
            <SafeArea className="flex items-end justify-center">
              <Caption text={scene.label} />
            </SafeArea>
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
}
