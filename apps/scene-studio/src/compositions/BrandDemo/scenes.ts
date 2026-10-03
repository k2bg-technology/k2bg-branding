import type { ComponentType } from 'react';

import { TitleScene } from './TitleScene';
import { TokenScene } from './TokenScene';
import { TypographyScene } from './TypographyScene';

export const SCENE_DURATION_IN_FRAMES = 150;

export const brandDemoScenes = [
  { name: 'title', component: TitleScene },
  { name: 'tokens', component: TokenScene },
  { name: 'typography', component: TypographyScene },
] as const satisfies ReadonlyArray<{
  name: string;
  component: ComponentType;
}>;

export function getBrandDemoDurationInFrames(): number {
  return brandDemoScenes.length * SCENE_DURATION_IN_FRAMES;
}
