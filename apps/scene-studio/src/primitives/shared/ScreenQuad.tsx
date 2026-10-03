import { useState } from 'react';
import type { IUniform, Texture, Vector2, Vector3 } from 'three';

type UniformValue = number | Vector2 | Vector3 | Texture;

interface Props {
  fragmentShader: string;
  vertexShader?: string;
  uniformValues: Record<string, UniformValue>;
  transparent?: boolean;
}

const PASSTHROUGH_VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// Fullscreen NDC quad: the vertex shaders bypass the camera matrices, so the
// 2x2 plane always covers the whole canvas. ShaderMaterial captures its
// uniforms object at construction, so the record identity must stay stable
// (created once below); per-frame values are routed through pierced props
// (uniforms-<name>-value) so the reconciler applies them in the same commit
// that triggers the frame draw — mutating the captured record during render is
// not picked up reliably during sequential rendering, and useFrame is
// off-limits (animations must be pure functions of the current frame). The
// uniform key set is fixed per mount.
export function ScreenQuad({
  fragmentShader,
  vertexShader = PASSTHROUGH_VERTEX_SHADER,
  uniformValues,
  transparent = false,
}: Props) {
  const [uniforms] = useState<Record<string, IUniform>>(() =>
    Object.fromEntries(
      Object.entries(uniformValues).map(([name, value]) => [name, { value }])
    )
  );

  const piercedUniformProps = Object.fromEntries(
    Object.entries(uniformValues).map(([name, value]) => [
      `uniforms-${name}-value`,
      value,
    ])
  );

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={transparent}
        {...piercedUniformProps}
      />
    </mesh>
  );
}
