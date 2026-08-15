import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { Fragment } from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import {
  BrandOutro,
  Caption,
  GradientOverlay,
  Logo,
  MediaFrame,
  SafeArea,
  VideoTitle,
} from '../../primitives';
import type { VisualShowcaseProps } from '../../schemas/visualShowcase';
import { durationsInFrames } from '../../tokens/motion';
import { getKenBurnsTransform } from './kenBurns';
import {
  getItemDurationInFrames,
  VISUAL_SHOWCASE_TRANSITION_DURATION_IN_FRAMES,
} from './timeline';

interface ItemProps {
  item: VisualShowcaseProps['items'][number];
  itemIndex: number;
}

function VisualShowcaseItem({ item, itemIndex }: ItemProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationInFrames = getItemDurationInFrames(item.durationInSeconds);

  return (
    <AbsoluteFill>
      <MediaFrame
        mediaType={item.mediaType}
        src={item.src}
        startFromInFrames={
          item.startFromInSeconds === undefined
            ? undefined
            : Math.round(item.startFromInSeconds * fps)
        }
        transform={getKenBurnsTransform({
          frame,
          durationInFrames,
          itemIndex,
        })}
      />
      {item.caption === undefined ? null : (
        <>
          <GradientOverlay />
          <SafeArea className="flex flex-col justify-end">
            <Caption
              text={item.caption}
              exitAtFrame={durationInFrames - durationsInFrames.fast}
            />
          </SafeArea>
        </>
      )}
    </AbsoluteFill>
  );
}

export function VisualShowcase(props: VisualShowcaseProps) {
  return (
    <AbsoluteFill className="bg-base-black">
      <TransitionSeries>
        {props.items.map((item, itemIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: items are static composition props and never reorder at runtime
          <Fragment key={`${item.src}-${itemIndex}`}>
            <TransitionSeries.Sequence
              durationInFrames={getItemDurationInFrames(item.durationInSeconds)}
            >
              <VisualShowcaseItem item={item} itemIndex={itemIndex} />
            </TransitionSeries.Sequence>
            {itemIndex === props.items.length - 1 ? null : (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({
                  durationInFrames:
                    VISUAL_SHOWCASE_TRANSITION_DURATION_IN_FRAMES,
                })}
              />
            )}
          </Fragment>
        ))}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({
            durationInFrames: VISUAL_SHOWCASE_TRANSITION_DURATION_IN_FRAMES,
          })}
        />
        <TransitionSeries.Sequence durationInFrames={durationsInFrames.outro}>
          <BrandOutro cta={props.cta} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <SafeArea>
        <Logo />
      </SafeArea>
      <Sequence durationInFrames={durationsInFrames.titleHold}>
        <SafeArea className="flex flex-col justify-center gap-8">
          <VideoTitle title={props.title} />
          {props.subtitle === undefined ? null : (
            <Caption text={props.subtitle} enterDelayInFrames={10} />
          )}
        </SafeArea>
      </Sequence>
    </AbsoluteFill>
  );
}
