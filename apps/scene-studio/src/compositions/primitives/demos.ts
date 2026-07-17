import type { ComponentType } from 'react';

import { BrandOutroDemo } from './BrandOutroDemo';
import { CaptionDemo } from './CaptionDemo';
import { DepthGalleryDemo } from './DepthGalleryDemo';
import { GradientOverlayDemo } from './GradientOverlayDemo';
import { LogoDemo } from './LogoDemo';
import { MediaFrameDemo } from './MediaFrameDemo';
import { SafeAreaDemo } from './SafeAreaDemo';
import { VideoTitleDemo } from './VideoTitleDemo';

export const PRIMITIVE_DEMO_DURATION_IN_FRAMES = 150;

export const primitiveDemos = [
  { id: 'primitive-video-title', component: VideoTitleDemo },
  { id: 'primitive-caption', component: CaptionDemo },
  { id: 'primitive-safe-area', component: SafeAreaDemo },
  { id: 'primitive-gradient-overlay', component: GradientOverlayDemo },
  { id: 'primitive-logo', component: LogoDemo },
  { id: 'primitive-media-frame', component: MediaFrameDemo },
  { id: 'primitive-depth-gallery', component: DepthGalleryDemo },
  { id: 'primitive-brand-outro', component: BrandOutroDemo },
] as const satisfies ReadonlyArray<{
  id: string;
  component: ComponentType;
}>;
