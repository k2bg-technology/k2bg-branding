import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import {
  getDollyDistance,
  getPlaneOpacity,
  getPlanePlacement,
} from './depthMotion';
import { ImagePlane } from './ImagePlane';

interface Props {
  sources: string[];
  durationInFrames?: number;
}

const CAMERA_FOV_IN_DEGREES = 50;

// The dolly spans `durationInFrames`; it defaults to the composition length,
// so override it when the gallery lives inside a shorter Sequence.
export function DepthGallery({ sources, durationInFrames }: Props) {
  const frame = useCurrentFrame();
  const {
    width,
    height,
    durationInFrames: compositionDurationInFrames,
  } = useVideoConfig();
  const dollyDistance = getDollyDistance({
    frame,
    durationInFrames: durationInFrames ?? compositionDurationInFrames,
    planeCount: sources.length,
  });

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ fov: CAMERA_FOV_IN_DEGREES, position: [0, 0, 0] }}
    >
      {/* The camera stays fixed; translating the plane group toward it keeps
          the dolly a pure function of the current frame. */}
      <group position={[0, 0, dollyDistance]}>
        {sources.map((source, planeIndex) => {
          const placement = getPlanePlacement({ planeIndex });

          return (
            <ImagePlane
              key={source}
              src={source}
              position={[placement.x, placement.y, placement.z]}
              opacity={getPlaneOpacity({
                planeZ: placement.z,
                dollyDistance,
              })}
            />
          );
        })}
      </group>
    </ThreeCanvas>
  );
}
