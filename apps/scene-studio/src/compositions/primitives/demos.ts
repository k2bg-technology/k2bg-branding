import type { ComponentType } from 'react';

import { BrandOutroDemo } from './BrandOutroDemo';
import { CaptionDemo } from './CaptionDemo';
import { ChannelShiftDemo } from './ChannelShiftDemo';
import { DepthGalleryDemo } from './DepthGalleryDemo';
import { GradientFlowDemo } from './GradientFlowDemo';
import { GradientOverlayDemo } from './GradientOverlayDemo';
import { InvertBlendDemo } from './InvertBlendDemo';
import { LogoDemo } from './LogoDemo';
import { MediaFrameDemo } from './MediaFrameDemo';
import { MosaicDemo } from './MosaicDemo';
import { SafeAreaDemo } from './SafeAreaDemo';
import { SignalNoiseDemo } from './SignalNoiseDemo';
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
  { id: 'primitive-channel-shift', component: ChannelShiftDemo },
  { id: 'primitive-invert-blend', component: InvertBlendDemo },
  { id: 'primitive-mosaic', component: MosaicDemo },
  { id: 'primitive-gradient-flow', component: GradientFlowDemo },
  { id: 'primitive-signal-noise', component: SignalNoiseDemo },
  { id: 'primitive-brand-outro', component: BrandOutroDemo },
] as const satisfies ReadonlyArray<{
  id: string;
  component: ComponentType;
}>;
