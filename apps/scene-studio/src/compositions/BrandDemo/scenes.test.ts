import { describe, expect, it } from 'vitest';

import {
  brandDemoScenes,
  getBrandDemoDurationInFrames,
  SCENE_DURATION_IN_FRAMES,
} from './scenes';

describe('brandDemoScenes', () => {
  it('orders scenes as title, tokens, typography', () => {
    const sceneNames = brandDemoScenes.map((scene) => scene.name);

    expect(sceneNames).toEqual(['title', 'tokens', 'typography']);
  });

  it('gives every scene the shared scene duration', () => {
    const expectedSceneDurationInFrames = 150;

    expect(SCENE_DURATION_IN_FRAMES).toBe(expectedSceneDurationInFrames);
  });
});

describe('getBrandDemoDurationInFrames', () => {
  it('keeps the demo at 15 seconds at 30fps', () => {
    const expectedDurationInFrames = 450;

    const result = getBrandDemoDurationInFrames();

    expect(result).toBe(expectedDurationInFrames);
  });
});
