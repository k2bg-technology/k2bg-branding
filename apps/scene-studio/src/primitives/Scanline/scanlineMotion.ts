// Drift wraps at one line period so the CSS offset stays bounded while the
// pattern appears to scroll forever.
export function getScanlineOffsetInPx(input: {
  frame: number;
  fps: number;
  driftSpeedInPxPerSecond: number;
  spacingInPx: number;
}): number {
  const travelledInPx =
    (input.frame / input.fps) * input.driftSpeedInPxPerSecond;

  return (
    ((travelledInPx % input.spacingInPx) + input.spacingInPx) %
    input.spacingInPx
  );
}
