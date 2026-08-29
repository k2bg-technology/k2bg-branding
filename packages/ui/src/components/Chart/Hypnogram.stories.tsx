import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Hypnogram, type HypnogramSegment, HypnogramStage } from '.';

const minuteMs = 60_000;

const stageLabels = {
  awake: 'Awake',
  rem: 'REM',
  core: 'Core',
  deep: 'Deep',
};

function buildSegments(
  startTime: number,
  durations: [HypnogramStage, number][]
): HypnogramSegment[] {
  let cursor = startTime;
  return durations.map(([stage, minutes]) => {
    const segment = { start: cursor, end: cursor + minutes * minuteMs, stage };
    cursor = segment.end;
    return segment;
  });
}

/** Roughly ninety-minute cycles, deepening early and shifting to REM by morning. */
const nightDurations: [HypnogramStage, number][] = [
  [HypnogramStage.AWAKE, 8],
  [HypnogramStage.CORE, 22],
  [HypnogramStage.DEEP, 35],
  [HypnogramStage.CORE, 20],
  [HypnogramStage.REM, 12],
  [HypnogramStage.CORE, 18],
  [HypnogramStage.DEEP, 28],
  [HypnogramStage.CORE, 24],
  [HypnogramStage.REM, 22],
  [HypnogramStage.AWAKE, 4],
  [HypnogramStage.CORE, 22],
  [HypnogramStage.DEEP, 18],
  [HypnogramStage.CORE, 26],
  [HypnogramStage.REM, 26],
  [HypnogramStage.CORE, 28],
  [HypnogramStage.DEEP, 10],
  [HypnogramStage.CORE, 20],
  [HypnogramStage.REM, 30],
  [HypnogramStage.AWAKE, 6],
  [HypnogramStage.CORE, 20],
  [HypnogramStage.REM, 21],
];

const napDurations: [HypnogramStage, number][] = [
  [HypnogramStage.AWAKE, 3],
  [HypnogramStage.CORE, 12],
  [HypnogramStage.DEEP, 18],
  [HypnogramStage.CORE, 8],
  [HypnogramStage.AWAKE, 4],
];

const meta = {
  component: Hypnogram,
  args: {
    label: 'Sleep stages for the night of 14 August 2026, 23:30 to 06:30',
    // 23:30 Asia/Tokyo through 06:30 the next morning.
    segments: buildSegments(Date.parse('2026-08-14T14:30:00Z'), nightDurations),
    stageLabels,
    timeZone: 'Asia/Tokyo',
  },
  argTypes: {
    timeZone: {
      control: 'select',
      options: ['UTC', 'Asia/Tokyo', 'Europe/Berlin', 'America/New_York'],
    },
  },
  play: async ({ args, canvas }) => {
    const chart = canvas.getByRole('img', { name: args.label });

    await expect(
      chart.querySelectorAll('[data-slot="hypnogram-segment"]')
    ).toHaveLength(args.segments.length);
  },
  parameters: {
    docs: {
      description: {
        component: 'components.hypnogram.description',
      },
      overview: 'components.hypnogram.overview',
      usage: 'components.hypnogram.usage',
      accessibility: 'components.hypnogram.accessibility',
      doList: 'components.hypnogram.doList',
      dontList: 'components.hypnogram.dontList',
      relatedComponents: 'components.hypnogram.relatedComponents',
      dependencies: 'components.hypnogram.dependencies',
      references: 'components.hypnogram.references',
    },
  },
} satisfies Meta<typeof Hypnogram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortNap: Story = {
  args: {
    label:
      'Sleep stages for the afternoon nap of 15 August 2026, 13:00 to 13:45',
    // 13:00 Asia/Tokyo.
    segments: buildSegments(Date.parse('2026-08-15T04:00:00Z'), napDurations),
  },
};
