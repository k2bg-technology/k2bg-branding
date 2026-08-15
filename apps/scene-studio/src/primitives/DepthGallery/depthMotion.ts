import { Easing, interpolate } from 'remotion';

// World-unit layout of the gallery corridor: planes sit PLANE_SPACING apart
// along -z and alternate laterally so the dolly path reads as depth, not a
// flat slideshow.
export const PLANE_SPACING_IN_WORLD_UNITS = 2.5;
export const LATERAL_OFFSET_IN_WORLD_UNITS = 0.6;
export const VERTICAL_OFFSET_IN_WORLD_UNITS = 0.25;

const FAR_FADE_START_DISTANCE_IN_WORLD_UNITS = 6;
const FAR_FADE_END_DISTANCE_IN_WORLD_UNITS = 8;
const NEAR_FADE_START_DISTANCE_IN_WORLD_UNITS = 0.2;
const NEAR_FADE_END_DISTANCE_IN_WORLD_UNITS = 1.2;

const CLAMP_OPTIONS = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

export function getDollyDistance(input: {
  frame: number;
  durationInFrames: number;
  planeCount: number;
}): number {
  const travelDistance = (input.planeCount - 1) * PLANE_SPACING_IN_WORLD_UNITS;

  return interpolate(
    input.frame,
    [0, input.durationInFrames - 1],
    [0, travelDistance],
    { ...CLAMP_OPTIONS, easing: Easing.inOut(Easing.ease) }
  );
}

export function getPlanePlacement(input: { planeIndex: number }): {
  x: number;
  y: number;
  z: number;
} {
  const lateralDirection = input.planeIndex % 2 === 0 ? -1 : 1;

  return {
    x: lateralDirection * LATERAL_OFFSET_IN_WORLD_UNITS,
    y: -lateralDirection * VERTICAL_OFFSET_IN_WORLD_UNITS,
    z: -(input.planeIndex + 1) * PLANE_SPACING_IN_WORLD_UNITS,
  };
}

export function getPlaneOpacity(input: {
  planeZ: number;
  dollyDistance: number;
}): number {
  // The dolly moves the plane group toward the camera at z = 0, so the
  // distance still in front of the camera shrinks as the journey progresses.
  const distanceInFrontOfCamera = -(input.planeZ + input.dollyDistance);

  const farFade = interpolate(
    distanceInFrontOfCamera,
    [
      FAR_FADE_START_DISTANCE_IN_WORLD_UNITS,
      FAR_FADE_END_DISTANCE_IN_WORLD_UNITS,
    ],
    [1, 0],
    CLAMP_OPTIONS
  );
  const nearFade = interpolate(
    distanceInFrontOfCamera,
    [
      NEAR_FADE_START_DISTANCE_IN_WORLD_UNITS,
      NEAR_FADE_END_DISTANCE_IN_WORLD_UNITS,
    ],
    [0, 1],
    CLAMP_OPTIONS
  );

  return farFade * nearFade;
}
