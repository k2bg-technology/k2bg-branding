import { AbsoluteFill } from 'remotion';
import { DepthGallery } from '../../primitives';

const CARD_DEFINITIONS = [
  { background: '#b8d200', foreground: '#1a1c1e', label: '1' },
  { background: '#474a4d', foreground: '#f8b500', label: '2' },
  { background: '#f8b500', foreground: '#1a1c1e', label: '3' },
  { background: '#1a1c1e', foreground: '#b8d200', label: '4' },
];

function createCardSource(definition: (typeof CARD_DEFINITIONS)[number]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><rect width="600" height="900" fill="${definition.background}"/><circle cx="300" cy="330" r="150" fill="${definition.foreground}" opacity="0.35"/><text x="300" y="640" font-family="Helvetica, Arial, sans-serif" font-size="320" font-weight="700" fill="${definition.foreground}" text-anchor="middle">${definition.label}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const CARD_SOURCES = CARD_DEFINITIONS.map(createCardSource);

export function DepthGalleryDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <DepthGallery sources={CARD_SOURCES} />
    </AbsoluteFill>
  );
}
