export type EdgeBlurEdge = 'top' | 'bottom';

export function getEdgeBlurMask(edge: EdgeBlurEdge): string {
  return edge === 'top'
    ? 'linear-gradient(to bottom, black, transparent)'
    : 'linear-gradient(to top, black, transparent)';
}
