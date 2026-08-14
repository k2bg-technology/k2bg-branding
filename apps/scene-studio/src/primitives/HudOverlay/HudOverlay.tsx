import { useCurrentFrame, useVideoConfig } from 'remotion';

import { cn } from '../../utils/cn';
import { getSeededRandom } from '../../utils/seededRandom';
import { formatTimecode, getHudMarkState, type HudMarkKind } from './hudMotion';

const BASE_COLOR = 'var(--color-base-white)';
const ACCENT_COLOR = 'var(--color-main-default)';
// Share of marks tinted with the brand color; a sparse accent keeps the
// overlay reading as instrumentation rather than decoration.
const ACCENT_SHARE = 0.25;
const STROKE_WIDTH_IN_PX = 1.5;
const RULE_LENGTH_FACTOR = 4;
const RULE_THICKNESS_IN_PX = 2;
const TIMECODE_MARGIN_IN_PX = 64;
const TIMECODE_FONT_SIZE_IN_PX = 22;

interface HudMarkShapeProps {
  kind: HudMarkKind;
  sizeInPx: number;
  color: string;
}

function HudMarkShape({ kind, sizeInPx, color }: HudMarkShapeProps) {
  const center = sizeInPx / 2;

  if (kind === 'dot') {
    return (
      <svg aria-hidden="true" width={sizeInPx} height={sizeInPx}>
        <circle cx={center} cy={center} r={sizeInPx / 4} fill={color} />
      </svg>
    );
  }

  if (kind === 'rule') {
    const lengthInPx = sizeInPx * RULE_LENGTH_FACTOR;

    return (
      <svg aria-hidden="true" width={lengthInPx} height={RULE_THICKNESS_IN_PX}>
        <rect width={lengthInPx} height={RULE_THICKNESS_IN_PX} fill={color} />
      </svg>
    );
  }

  if (kind === 'tick') {
    return (
      <svg aria-hidden="true" width={sizeInPx} height={sizeInPx}>
        <line
          x1={center}
          y1={0}
          x2={center}
          y2={sizeInPx}
          stroke={color}
          strokeWidth={STROKE_WIDTH_IN_PX}
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" width={sizeInPx} height={sizeInPx}>
      <line
        x1={0}
        y1={center}
        x2={sizeInPx}
        y2={center}
        stroke={color}
        strokeWidth={STROKE_WIDTH_IN_PX}
      />
      <line
        x1={center}
        y1={0}
        x2={center}
        y2={sizeInPx}
        stroke={color}
        strokeWidth={STROKE_WIDTH_IN_PX}
      />
    </svg>
  );
}

interface Props {
  count?: number;
  opacity?: number;
  seed?: number;
  showsTimecode?: boolean;
  className?: string;
}

export function HudOverlay({
  count = 24,
  opacity = 0.6,
  seed = 0,
  showsTimecode = true,
  className,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const marks = Array.from({ length: count }, (_, markIndex) => ({
    markIndex,
    color:
      getSeededRandom(markIndex + 41, seed) < ACCENT_SHARE
        ? ACCENT_COLOR
        : BASE_COLOR,
    ...getHudMarkState({ markIndex, frame, seed }),
  }));

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
      style={{ opacity }}
    >
      {marks.map((mark) => (
        <div
          key={`hud-mark-${mark.markIndex}`}
          style={{
            position: 'absolute',
            left: `${mark.xInPercent}%`,
            top: `${mark.yInPercent}%`,
            opacity: mark.opacity,
            transform: `translate(-50%, -50%) rotate(${mark.rotationInDegrees}deg)`,
          }}
        >
          <HudMarkShape
            kind={mark.kind}
            sizeInPx={mark.sizeInPx}
            color={mark.color}
          />
        </div>
      ))}
      {showsTimecode ? (
        <span
          className="absolute font-original text-base-white"
          style={{
            left: TIMECODE_MARGIN_IN_PX,
            bottom: TIMECODE_MARGIN_IN_PX,
            fontSize: TIMECODE_FONT_SIZE_IN_PX,
            letterSpacing: '0.2em',
          }}
        >
          {formatTimecode({ frame, fps })}
        </span>
      ) : null}
    </div>
  );
}
