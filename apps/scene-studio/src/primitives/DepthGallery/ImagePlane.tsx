import { useImageTexture } from '../shared/useImageTexture';

interface Props {
  src: string;
  position: readonly [number, number, number];
  opacity: number;
}

// Portrait 2:3 plane, matching the aspect ratio of typical photo cards.
const PLANE_WIDTH_IN_WORLD_UNITS = 2;
const PLANE_HEIGHT_IN_WORLD_UNITS = 3;

export function ImagePlane({ src, position, opacity }: Props) {
  const texture = useImageTexture(src);

  if (!texture) {
    return null;
  }

  return (
    <mesh position={[position[0], position[1], position[2]]}>
      <planeGeometry
        args={[PLANE_WIDTH_IN_WORLD_UNITS, PLANE_HEIGHT_IN_WORLD_UNITS]}
      />
      <meshBasicMaterial map={texture} transparent opacity={opacity} />
    </mesh>
  );
}
