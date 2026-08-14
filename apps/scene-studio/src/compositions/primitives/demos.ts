import type { ComponentType } from 'react';

import { BrandOutroDemo } from './BrandOutroDemo';
import { CaptionDemo } from './CaptionDemo';
import { ChannelShiftDemo } from './ChannelShiftDemo';
import { DepthGalleryDemo } from './DepthGalleryDemo';
import { DepthParallaxDemo } from './DepthParallaxDemo';
import { DuotoneDemo } from './DuotoneDemo';
import { EdgeBlurDemo } from './EdgeBlurDemo';
import { FilmGrainDemo } from './FilmGrainDemo';
import { FluidDistortionDemo } from './FluidDistortionDemo';
import { GlitchShiftDemo } from './GlitchShiftDemo';
import { GradientFlowDemo } from './GradientFlowDemo';
import { GradientOverlayDemo } from './GradientOverlayDemo';
import { GridDisplacementDemo } from './GridDisplacementDemo';
import { HalftoneDemo } from './HalftoneDemo';
import { InvertBlendDemo } from './InvertBlendDemo';
import { KaleidoscopeDemo } from './KaleidoscopeDemo';
import { LightLeakDemo } from './LightLeakDemo';
import { LogoDemo } from './LogoDemo';
import { MediaFrameDemo } from './MediaFrameDemo';
import { MosaicDemo } from './MosaicDemo';
import { PaintRevealDemo } from './PaintRevealDemo';
import { PaintSmearDemo } from './PaintSmearDemo';
import { ParticleDriftDemo } from './ParticleDriftDemo';
import { ParticleRevealDemo } from './ParticleRevealDemo';
import { PostFxStageDemo } from './PostFxStageDemo';
import { SafeAreaDemo } from './SafeAreaDemo';
import { ScanlineDemo } from './ScanlineDemo';
import { SignalNoiseDemo } from './SignalNoiseDemo';
import { VideoTitleDemo } from './VideoTitleDemo';
import { WaveDistortionDemo } from './WaveDistortionDemo';

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
  { id: 'primitive-scanline', component: ScanlineDemo },
  { id: 'primitive-logo', component: LogoDemo },
  { id: 'primitive-media-frame', component: MediaFrameDemo },
  { id: 'primitive-depth-gallery', component: DepthGalleryDemo },
  { id: 'primitive-depth-parallax', component: DepthParallaxDemo },
  { id: 'primitive-post-fx-stage', component: PostFxStageDemo },
  { id: 'primitive-channel-shift', component: ChannelShiftDemo },
  { id: 'primitive-invert-blend', component: InvertBlendDemo },
  { id: 'primitive-mosaic', component: MosaicDemo },
  { id: 'primitive-wave-distortion', component: WaveDistortionDemo },
  { id: 'primitive-fluid-distortion', component: FluidDistortionDemo },
  { id: 'primitive-grid-displacement', component: GridDisplacementDemo },
  { id: 'primitive-glitch-shift', component: GlitchShiftDemo },
  { id: 'primitive-halftone', component: HalftoneDemo },
  { id: 'primitive-duotone', component: DuotoneDemo },
  { id: 'primitive-kaleidoscope', component: KaleidoscopeDemo },
  { id: 'primitive-paint-reveal', component: PaintRevealDemo },
  { id: 'primitive-paint-smear', component: PaintSmearDemo },
  { id: 'primitive-gradient-flow', component: GradientFlowDemo },
  { id: 'primitive-signal-noise', component: SignalNoiseDemo },
  { id: 'primitive-brand-outro', component: BrandOutroDemo },
] as const satisfies ReadonlyArray<{
  id: string;
  component: ComponentType;
}>;
