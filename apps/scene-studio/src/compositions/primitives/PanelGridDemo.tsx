import { AbsoluteFill } from 'remotion';
import { PanelGrid, type PanelItem } from '../../primitives/PanelGrid';
import { SAMPLE_IMAGE_SOURCE } from './sampleImage';

const PANEL_ITEMS: PanelItem[] = [
  { src: SAMPLE_IMAGE_SOURCE },
  { src: SAMPLE_IMAGE_SOURCE },
  { src: SAMPLE_IMAGE_SOURCE },
];

export function PanelGridDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <PanelGrid
        items={PANEL_ITEMS}
        columns={1}
        borderWidthInPx={6}
        staggerInFrames={6}
        exitAtFrame={110}
      />
    </AbsoluteFill>
  );
}
