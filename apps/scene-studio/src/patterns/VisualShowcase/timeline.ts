import type { CalculateMetadataFunction } from 'remotion';

import {
  type VisualShowcaseProps,
  visualShowcaseSchema,
} from '../../schemas/visualShowcase';
import { durationsInFrames, SCENE_FPS } from '../../tokens/motion';

export const VISUAL_SHOWCASE_TRANSITION_DURATION_IN_FRAMES =
  durationsInFrames.transition;

export function getItemDurationInFrames(durationInSeconds: number): number {
  return Math.round(durationInSeconds * SCENE_FPS);
}

export function getVisualShowcaseDurationInFrames(
  props: VisualShowcaseProps
): number {
  const itemDurationInFrames = props.items.reduce(
    (totalDurationInFrames, item) =>
      totalDurationInFrames + getItemDurationInFrames(item.durationInSeconds),
    0
  );
  const transitionOverlapInFrames =
    props.items.length * VISUAL_SHOWCASE_TRANSITION_DURATION_IN_FRAMES;

  return (
    itemDurationInFrames - transitionOverlapInFrames + durationsInFrames.outro
  );
}

export const calculateVisualShowcaseMetadata: CalculateMetadataFunction<
  VisualShowcaseProps
> = ({ props }) => {
  const validProps = visualShowcaseSchema.parse(props);

  return { durationInFrames: getVisualShowcaseDurationInFrames(validProps) };
};
