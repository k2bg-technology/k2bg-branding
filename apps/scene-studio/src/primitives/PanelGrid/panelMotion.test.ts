import { describe, expect, it } from 'vitest';

import { durationsInFrames } from '../../tokens/motion';
import { getPanelEnterDirection, getPanelMotion } from './panelMotion';

const ENTER_DELAY_IN_FRAMES = 6;
const STAGGER_IN_FRAMES = 5;
const PANEL_TRAVEL_IN_PERCENT = 110;

describe('getPanelEnterDirection', () => {
  it.each([
    { panelIndex: 0, enterFrom: 'alternate' as const, expected: -1 },
    { panelIndex: 1, enterFrom: 'alternate' as const, expected: 1 },
    { panelIndex: 2, enterFrom: 'alternate' as const, expected: -1 },
    { panelIndex: 1, enterFrom: 'left' as const, expected: -1 },
    { panelIndex: 0, enterFrom: 'right' as const, expected: 1 },
    { panelIndex: 3, enterFrom: 'right' as const, expected: 1 },
  ])('returns $expected for panel $panelIndex entering from $enterFrom', ({
    panelIndex,
    enterFrom,
    expected,
  }) => {
    const result = getPanelEnterDirection({ panelIndex, enterFrom });

    expect(result).toBe(expected);
  });
});

describe('getPanelMotion', () => {
  it('holds the panel offscreen and transparent before its slot', () => {
    const panelIndex = 1;

    const result = getPanelMotion({
      panelIndex,
      frame: ENTER_DELAY_IN_FRAMES + panelIndex * STAGGER_IN_FRAMES - 1,
      enterDelayInFrames: ENTER_DELAY_IN_FRAMES,
      staggerInFrames: STAGGER_IN_FRAMES,
      enterFrom: 'alternate',
    });

    expect(result.translateXInPercent).toBeCloseTo(PANEL_TRAVEL_IN_PERCENT);
    expect(result.opacity).toBe(0);
  });

  it('settles the panel in place once its enter animation ends', () => {
    const panelIndex = 2;

    const result = getPanelMotion({
      panelIndex,
      frame:
        ENTER_DELAY_IN_FRAMES +
        panelIndex * STAGGER_IN_FRAMES +
        durationsInFrames.enter,
      enterDelayInFrames: ENTER_DELAY_IN_FRAMES,
      staggerInFrames: STAGGER_IN_FRAMES,
      enterFrom: 'alternate',
    });

    expect(result.translateXInPercent).toBeCloseTo(0);
    expect(result.opacity).toBeCloseTo(1);
  });

  it('starts each panel one stagger after the previous one', () => {
    const frame = ENTER_DELAY_IN_FRAMES + 4;

    const leadingPanel = getPanelMotion({
      panelIndex: 0,
      frame,
      enterDelayInFrames: ENTER_DELAY_IN_FRAMES,
      staggerInFrames: STAGGER_IN_FRAMES,
      enterFrom: 'left',
    });
    const trailingPanel = getPanelMotion({
      panelIndex: 1,
      frame: frame + STAGGER_IN_FRAMES,
      enterDelayInFrames: ENTER_DELAY_IN_FRAMES,
      staggerInFrames: STAGGER_IN_FRAMES,
      enterFrom: 'left',
    });

    expect(trailingPanel).toEqual(leadingPanel);
  });

  it('slides the panel back out after its exit animation ends', () => {
    const panelIndex = 1;
    const exitAtFrame = 100;

    const result = getPanelMotion({
      panelIndex,
      frame:
        exitAtFrame + panelIndex * STAGGER_IN_FRAMES + durationsInFrames.fast,
      enterDelayInFrames: ENTER_DELAY_IN_FRAMES,
      staggerInFrames: STAGGER_IN_FRAMES,
      enterFrom: 'alternate',
      exitAtFrame,
    });

    expect(result.translateXInPercent).toBeCloseTo(PANEL_TRAVEL_IN_PERCENT);
    expect(result.opacity).toBe(0);
  });

  it('keeps the panel in place when no exit frame is set', () => {
    const lateFrame = 500;

    const result = getPanelMotion({
      panelIndex: 1,
      frame: lateFrame,
      enterDelayInFrames: ENTER_DELAY_IN_FRAMES,
      staggerInFrames: STAGGER_IN_FRAMES,
      enterFrom: 'alternate',
    });

    expect(result.translateXInPercent).toBeCloseTo(0);
    expect(result.opacity).toBeCloseTo(1);
  });
});
