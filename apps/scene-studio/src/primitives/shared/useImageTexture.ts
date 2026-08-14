import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import {
  cancelRender,
  continueRender,
  delayRender,
  useRemotionEnvironment,
} from 'remotion';
import {
  type ColorSpace,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';

// Must be called under a ThreeCanvas: the redraw below relies on useThree.
export function useImageTexture(
  src: string,
  { colorSpace = SRGBColorSpace }: { colorSpace?: ColorSpace } = {}
): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null);
  const [delayRenderHandle] = useState(() =>
    delayRender(`Loading texture: ${src.slice(0, 48)}`)
  );
  const advance = useThree((state) => state.advance);
  const { isRendering } = useRemotionEnvironment();

  useEffect(() => {
    new TextureLoader().load(
      src,
      (loadedTexture) => {
        loadedTexture.colorSpace = colorSpace;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => cancelRender(error)
    );
  }, [src, colorSpace]);

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

  return texture;
}
