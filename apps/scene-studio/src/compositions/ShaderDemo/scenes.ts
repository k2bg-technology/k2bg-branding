import type { ComponentType } from 'react';

import { ChannelShiftDemo } from '../primitives/ChannelShiftDemo';
import { FluidDistortionDemo } from '../primitives/FluidDistortionDemo';
import { GradientFlowDemo } from '../primitives/GradientFlowDemo';
import { GridDisplacementDemo } from '../primitives/GridDisplacementDemo';
import { InvertBlendDemo } from '../primitives/InvertBlendDemo';
import { MosaicDemo } from '../primitives/MosaicDemo';
import { SignalNoiseDemo } from '../primitives/SignalNoiseDemo';
import { WaveDistortionDemo } from '../primitives/WaveDistortionDemo';

export const SHADER_SCENE_DURATION_IN_FRAMES = 150;

export const shaderDemoScenes = [
  {
    name: 'channel-shift',
    label: 'Channel Shift',
    component: ChannelShiftDemo,
  },
  { name: 'invert-blend', label: 'Invert Blend', component: InvertBlendDemo },
  { name: 'mosaic', label: 'Mosaic', component: MosaicDemo },
  {
    name: 'wave-distortion',
    label: 'Wave Distortion',
    component: WaveDistortionDemo,
  },
  {
    name: 'fluid-distortion',
    label: 'Fluid Distortion',
    component: FluidDistortionDemo,
  },
  {
    name: 'grid-displacement',
    label: 'Grid Displacement',
    component: GridDisplacementDemo,
  },
  {
    name: 'gradient-flow',
    label: 'Gradient Flow',
    component: GradientFlowDemo,
  },
  { name: 'signal-noise', label: 'Signal Noise', component: SignalNoiseDemo },
] as const satisfies ReadonlyArray<{
  name: string;
  label: string;
  component: ComponentType;
}>;

export function getShaderDemoDurationInFrames(): number {
  return shaderDemoScenes.length * SHADER_SCENE_DURATION_IN_FRAMES;
}
