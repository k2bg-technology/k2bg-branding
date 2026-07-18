import type { ComponentType } from 'react';

import { BrandOutroDemo } from './BrandOutroDemo';
import { CaptionDemo } from './CaptionDemo';
import { ChannelShiftDemo } from './ChannelShiftDemo';
import { DepthGalleryDemo } from './DepthGalleryDemo';
import { EdgeBlurDemo } from './EdgeBlurDemo';
import { FilmGrainDemo } from './FilmGrainDemo';
import { GradientFlowDemo } from './GradientFlowDemo';
import { GradientOverlayDemo } from './GradientOverlayDemo';
import { InvertBlendDemo } from './InvertBlendDemo';
import { LightLeakDemo } from './LightLeakDemo';
import { LogoDemo } from './LogoDemo';
import { MediaFrameDemo } from './MediaFrameDemo';
import { MosaicDemo } from './MosaicDemo';
import { PaintRevealDemo } from './PaintRevealDemo';
import { PaintSmearDemo } from './PaintSmearDemo';
import { ParticleDriftDemo } from './ParticleDriftDemo';
import { ParticleRevealDemo } from './ParticleRevealDemo';
import { SafeAreaDemo } from './SafeAreaDemo';
import { SignalNoiseDemo } from './SignalNoiseDemo';
import { VideoTitleDemo } from './VideoTitleDemo';

export const PRIMITIVE_DEMO_DURATION_IN_FRAMES = 150;

export const primitiveDemos = [
  { id: 'primitive-video-title', component: VideoTitleDemo },
  { id: 'primitive-caption', component: CaptionDemo },
  { id: 'primitive-safe-area', component: SafeAreaDemo },
  { id: 'primitive-gradient-overlay', component: GradientOverlayDemo },
  { id: 'primitive-film-grain', component: FilmGrainDemo },
  { id: 'primitive-particle-drift', component: ParticleDriftDemo },
  { id: 'primitive-particle-reveal', component: ParticleRevealDemo },
  { id: 'primitive-light-leak', component: LightLeakDemo },
  { id: 'primitive-edge-blur', component: EdgeBlurDemo },
  { id: 'primitive-logo', component: LogoDemo },
  { id: 'primitive-media-frame', component: MediaFrameDemo },
  { id: 'primitive-depth-gallery', component: DepthGalleryDemo },
  { id: 'primitive-channel-shift', component: ChannelShiftDemo },
  { id: 'primitive-invert-blend', component: InvertBlendDemo },
  { id: 'primitive-mosaic', component: MosaicDemo },
  { id: 'primitive-paint-reveal', component: PaintRevealDemo },
  { id: 'primitive-paint-smear', component: PaintSmearDemo },
  { id: 'primitive-gradient-flow', component: GradientFlowDemo },
  { id: 'primitive-signal-noise', component: SignalNoiseDemo },
  { id: 'primitive-brand-outro', component: BrandOutroDemo },
] as const satisfies ReadonlyArray<{
  id: string;
  component: ComponentType;
}>;
