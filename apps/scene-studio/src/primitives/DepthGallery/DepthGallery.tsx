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
}

const CAMERA_FOV_IN_DEGREES = 50;

export function DepthGallery({ sources }: Props) {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const dollyDistance = getDollyDistance({
    frame,
    durationInFrames,
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
