import type { ComponentType } from 'react';

import { ChannelShiftDemo } from '../primitives/ChannelShiftDemo';
import { GradientFlowDemo } from '../primitives/GradientFlowDemo';
import { InvertBlendDemo } from '../primitives/InvertBlendDemo';
import { MosaicDemo } from '../primitives/MosaicDemo';
import { SignalNoiseDemo } from '../primitives/SignalNoiseDemo';

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
