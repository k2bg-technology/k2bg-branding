import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { MediaFrame } from '../MediaFrame';
import type { MediaType } from '../shared/MediaTextureStage';
import { getPanelMotion, type PanelEnterFrom } from './panelMotion';

export interface PanelItem {
  src: string;
  mediaType?: MediaType;
}

interface Props {
  items: PanelItem[];
  columns?: number;
  gapInPx?: number;
  borderWidthInPx?: number;
  borderColor?: string;
  backgroundColor?: string;
  enterDelayInFrames?: number;
  staggerInFrames?: number;
  enterFrom?: PanelEnterFrom;
  exitAtFrame?: number;
  className?: string;
}

// NOTE: every video panel mounts its own OffthreadVideo, so render cost grows
// linearly with the panel count — 2 to 4 panels is the intended range.
export function PanelGrid({
  items,
  columns = 1,
  gapInPx = 12,
  borderWidthInPx = 0,
  borderColor = 'var(--color-base-white)',
  backgroundColor = 'transparent',
  enterDelayInFrames = 0,
  staggerInFrames = 5,
  enterFrom = 'alternate',
  exitAtFrame,
  className,
}: Props) {
  const frame = useCurrentFrame();
  const panels = items.map((item, panelIndex) => ({
    ...item,
    panelIndex,
    ...getPanelMotion({
      panelIndex,
      frame,
      enterDelayInFrames,
      staggerInFrames,
      enterFrom,
      exitAtFrame,
    }),
  }));

  return (
    <AbsoluteFill
      className={className}
      style={{ backgroundColor, padding: gapInPx }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gapInPx,
          width: '100%',
          height: '100%',
        }}
      >
        {panels.map((panel) => (
          <div
            key={`panel-${panel.panelIndex}`}
            className="relative overflow-hidden"
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                boxSizing: 'border-box',
                border:
                  borderWidthInPx > 0
                    ? `${borderWidthInPx}px solid ${borderColor}`
                    : undefined,
                transform: `translateX(${panel.translateXInPercent}%)`,
                opacity: panel.opacity,
              }}
            >
              <MediaFrame
                src={panel.src}
                mediaType={panel.mediaType ?? 'image'}
              />
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}
