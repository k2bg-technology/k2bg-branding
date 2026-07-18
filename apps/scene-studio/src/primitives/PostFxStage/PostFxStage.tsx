import {
  Bloom,
  DepthOfField,
  EffectComposer,
  ToneMapping,
} from '@react-three/postprocessing';
import { ThreeCanvas } from '@remotion/three';
import { ToneMappingMode } from 'postprocessing';
import type { ReactNode } from 'react';
import { useVideoConfig } from 'remotion';

interface BloomOptions {
  intensity?: number;
  luminanceThreshold?: number;
}

interface DepthOfFieldOptions {
  focusDistance?: number;
  focalLength?: number;
  bokehScale?: number;
}

interface Props {
  bloom?: BloomOptions;
  depthOfField?: DepthOfFieldOptions;
  children: ReactNode;
}

// Hosts a 3D scene inside a ThreeCanvas and finishes it with composer-based
// post-processing. Without effect options the composer is skipped entirely,
// so the stage renders the bare scene. MSAA stays off (multisampling 0) —
// the documented safe baseline for composer effects.
export function PostFxStage({ bloom, depthOfField, children }: Props) {
  const { width, height } = useVideoConfig();

  const effects = [
    bloom ? (
      <Bloom
        key="bloom"
        mipmapBlur
        intensity={bloom.intensity ?? 1}
        luminanceThreshold={bloom.luminanceThreshold ?? 0.9}
      />
    ) : null,
    depthOfField ? (
      <DepthOfField
        key="depth-of-field"
        focusDistance={depthOfField.focusDistance ?? 0.02}
        focalLength={depthOfField.focalLength ?? 0.05}
        bokehScale={depthOfField.bokehScale ?? 3}
      />
    ) : null,
  ].filter((effect) => effect !== null);

  if (effects.length > 0) {
    // The composer disables the renderer's tone mapping while mounted, so
    // restore the default ACES output as the final pass — enabling an
    // effect must not change the color pipeline.
    effects.push(
      <ToneMapping key="tone-mapping" mode={ToneMappingMode.ACES_FILMIC} />
    );
  }

  return (
    <ThreeCanvas width={width} height={height}>
      {children}
      {effects.length > 0 ? (
        <EffectComposer multisampling={0}>{effects}</EffectComposer>
      ) : null}
    </ThreeCanvas>
  );
}
