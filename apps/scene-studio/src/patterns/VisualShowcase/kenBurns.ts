import { interpolate } from 'remotion';

interface KenBurnsTransformInput {
  frame: number;
  durationInFrames: number;
  itemIndex: number;
}

const PAN_DIRECTIONS = [
  { x: -2, y: -2 },
  { x: 2, y: -2 },
  { x: -2, y: 2 },
  { x: 2, y: 2 },
] as const;

export function getKenBurnsTransform({
  frame,
  durationInFrames,
  itemIndex,
}: KenBurnsTransformInput): string {
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panDirection =
    PAN_DIRECTIONS[itemIndex % PAN_DIRECTIONS.length] ?? PAN_DIRECTIONS[0];
  const scale = interpolate(progress, [0, 1], [1, 1.08]);
  const translateX = interpolate(progress, [0, 1], [0, panDirection.x]);
  const translateY = interpolate(progress, [0, 1], [0, panDirection.y]);

  return `scale(${scale}) translate(${translateX}%, ${translateY}%)`;
}
