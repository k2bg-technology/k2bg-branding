import { describe, expect, it } from 'vitest';

import {
  getShaderDemoDurationInFrames,
  SHADER_SCENE_DURATION_IN_FRAMES,
  shaderDemoScenes,
} from './scenes';

describe('shaderDemoScenes', () => {
  it('shows every shader effect in the planned order', () => {
    const sceneNames = shaderDemoScenes.map((scene) => scene.name);

    expect(sceneNames).toEqual([
      'channel-shift',
      'invert-blend',
      'mosaic',
      'wave-distortion',
      'fluid-distortion',
      'grid-displacement',
      'glitch-shift',
      'halftone',
      'duotone',
      'kaleidoscope',
      'depth-parallax',
      'gradient-flow',
      'signal-noise',
    ]);
  });

  it('labels every scene for the on-screen caption', () => {
    const labels = shaderDemoScenes.map((scene) => scene.label);

    expect(labels.every((label) => label.length > 0)).toBe(true);
  });
});

describe('getShaderDemoDurationInFrames', () => {
  it('multiplies the scene count by the scene duration', () => {
    const duration = getShaderDemoDurationInFrames();

    const expectedDuration =
      shaderDemoScenes.length * SHADER_SCENE_DURATION_IN_FRAMES;
    expect(duration).toBe(expectedDuration);
    expect(duration).toBe(1950);
  });
});
