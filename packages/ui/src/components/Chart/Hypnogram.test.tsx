import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Hypnogram, type HypnogramSegment, HypnogramStage } from '.';

const minuteMs = 60_000;
const tokyo = 'Asia/Tokyo';

/** 14:30 UTC is 23:30 in Tokyo, so the night crosses midnight there but not in UTC. */
const nightStart = Date.UTC(2026, 7, 14, 14, 30);

const stageLabels: Record<HypnogramStage, string> = {
  awake: 'Awake',
  rem: 'REM',
  core: 'Core',
  deep: 'Deep',
};

const stageOrder: HypnogramStage[] = [
  HypnogramStage.AWAKE,
  HypnogramStage.REM,
  HypnogramStage.CORE,
  HypnogramStage.DEEP,
];

/** An `HH:MM` tick label; stage labels never take this shape. */
const hourLabelPattern = /^\d{2}:\d{2}$/;

function buildSegments(
  startTime: number,
  durations: [HypnogramStage, number][]
) {
  return durations.reduce<HypnogramSegment[]>((segments, [stage, minutes]) => {
    const start = segments[segments.length - 1]?.end ?? startTime;
    segments.push({ start, end: start + minutes * minuteMs, stage });
    return segments;
  }, []);
}

/** 23:30 to 06:30 in Tokyo, returning to core between the deep and REM phases. */
function createNight() {
  return buildSegments(nightStart, [
    [HypnogramStage.AWAKE, 30],
    [HypnogramStage.CORE, 90],
    [HypnogramStage.DEEP, 120],
    [HypnogramStage.CORE, 90],
    [HypnogramStage.REM, 90],
  ]);
}

function createStageTour() {
  return buildSegments(
    nightStart,
    stageOrder.map((stage) => [stage, 60])
  );
}

function segmentRowYs(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll('[data-slot="hypnogram-segment"]'),
    (segment) => Number(segment.getAttribute('y1'))
  );
}

function hourTickLabels(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll('text'),
    (text) => text.textContent ?? ''
  ).filter((text) => hourLabelPattern.test(text));
}

describe('Hypnogram', () => {
  it('names the chart surface with the label', () => {
    const label = 'Sleep stages for the night of 14 August 2026';

    render(
      <Hypnogram
        label={label}
        segments={createNight()}
        stageLabels={stageLabels}
      />
    );

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('draws one line per segment', () => {
    const segments = createNight();

    const { container } = render(
      <Hypnogram label="Sleep" segments={segments} stageLabels={stageLabels} />
    );

    expect(segmentRowYs(container)).toHaveLength(segments.length);
  });

  it('gives every stage its own row', () => {
    const { container } = render(
      <Hypnogram
        label="Sleep"
        segments={createStageTour()}
        stageLabels={stageLabels}
      />
    );

    expect(new Set(segmentRowYs(container)).size).toBe(stageOrder.length);
  });

  it('orders the rows from awake at the top down to deep', () => {
    const { container } = render(
      <Hypnogram
        label="Sleep"
        segments={createStageTour()}
        stageLabels={stageLabels}
      />
    );

    const rowYs = segmentRowYs(container);
    expect(rowYs).toEqual(
      Array.from(rowYs).sort((first, second) => first - second)
    );
  });

  it('returns a repeated stage to the same row', () => {
    const firstCoreIndex = 1;
    const secondCoreIndex = 3;

    const { container } = render(
      <Hypnogram
        label="Sleep"
        segments={createNight()}
        stageLabels={stageLabels}
      />
    );

    const rowYs = segmentRowYs(container);
    expect(rowYs[secondCoreIndex]).toBe(rowYs[firstCoreIndex]);
  });

  it('renders the provided label for a sleep stage', () => {
    const stageLabels = {
      awake: 'Awake',
      rem: 'Dream sleep',
      core: 'Core',
      deep: 'Deep',
    };

    render(
      <Hypnogram
        label="Sleep"
        segments={createNight()}
        stageLabels={stageLabels}
      />
    );

    expect(screen.getByText('Dream sleep')).toBeInTheDocument();
  });

  it.each`
    description         | timeZone     | expectedLabel | absentLabel
    ${'Asia/Tokyo'}     | ${tokyo}     | ${'00:00'}    | ${'15:00'}
    ${'UTC by default'} | ${undefined} | ${'15:00'}    | ${'00:00'}
  `(
    'labels the hour ticks on the wall clock of $description',
    ({ timeZone, expectedLabel, absentLabel }) => {
      const { container } = render(
        <Hypnogram
          label="Sleep"
          segments={createNight()}
          stageLabels={stageLabels}
          timeZone={timeZone}
        />
      );

      const labels = hourTickLabels(container);
      expect(labels).toContain(expectedLabel);
      expect(labels).not.toContain(absentLabel);
    }
  );

  it('anchors the axis at the start and the end of the night', () => {
    const { container } = render(
      <Hypnogram
        label="Sleep"
        segments={createNight()}
        stageLabels={stageLabels}
        timeZone={tokyo}
      />
    );

    const labels = hourTickLabels(container);
    expect(labels[0]).toBe('23:30');
    expect(labels[labels.length - 1]).toBe('06:30');
  });

  it('anchors the axis at the earliest segment when the segments are unordered', () => {
    const unordered = Array.from(createNight()).reverse();

    const { container } = render(
      <Hypnogram
        label="Sleep"
        segments={unordered}
        stageLabels={stageLabels}
        timeZone={tokyo}
      />
    );

    expect(hourTickLabels(container)[0]).toBe('23:30');
  });

  it('thins the hour ticks over a long night', () => {
    const nightHours = 12;
    const longNight = buildSegments(Date.UTC(2026, 7, 14, 20), [
      [HypnogramStage.CORE, nightHours * 60],
    ]);
    const maxHourTicks = 6;
    /** The night's own start and end sit outside the thinned hour ticks. */
    const nightEdgeTicks = 2;

    const { container } = render(
      <Hypnogram label="Sleep" segments={longNight} stageLabels={stageLabels} />
    );

    const thinnedHourTicks = hourTickLabels(container).length - nightEdgeTicks;
    expect(thinnedHourTicks).toBeGreaterThan(0);
    expect(thinnedHourTicks).toBeLessThanOrEqual(maxHourTicks);
  });
});
