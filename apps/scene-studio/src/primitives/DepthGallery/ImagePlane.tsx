import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import {
  cancelRender,
  continueRender,
  delayRender,
  useRemotionEnvironment,
} from 'remotion';
import { SRGBColorSpace, type Texture, TextureLoader } from 'three';

interface Props {
  src: string;
  position: readonly [number, number, number];
  opacity: number;
}

// Portrait 2:3 plane, matching the aspect ratio of typical photo cards.
const PLANE_WIDTH_IN_WORLD_UNITS = 2;
const PLANE_HEIGHT_IN_WORLD_UNITS = 3;

export function ImagePlane({ src, position, opacity }: Props) {
  const [texture, setTexture] = useState<Texture | null>(null);
  const [delayRenderHandle] = useState(() =>
    delayRender(`Loading DepthGallery texture: ${src.slice(0, 48)}`)
  );
  const advance = useThree((state) => state.advance);
  const { isRendering } = useRemotionEnvironment();

  useEffect(() => {
    new TextureLoader().load(
      src,
      (loadedTexture) => {
        loadedTexture.colorSpace = SRGBColorSpace;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => cancelRender(error)
    );
  }, [src]);

  useEffect(() => {
    if (!texture) {
      return;
    }
    // During rendering the frameloop is 'never' and the canvas was already
    // drawn for this frame before the texture arrived; advance once so the
    // screenshot includes the textured mesh, then release Remotion.
    if (isRendering) {
      advance(performance.now());
    }
    continueRender(delayRenderHandle);
  }, [texture, isRendering, advance, delayRenderHandle]);

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
