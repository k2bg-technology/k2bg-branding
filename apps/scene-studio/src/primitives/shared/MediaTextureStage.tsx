import { useThree } from '@react-three/fiber';
import {
  ThreeCanvas,
  useOffthreadVideoTexture,
  useVideoTexture,
} from '@remotion/three';
import { type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import {
  continueRender,
  delayRender,
  useCurrentFrame,
  useRemotionEnvironment,
  useVideoConfig,
  Video,
} from 'remotion';
import type { ColorSpace, Texture } from 'three';

import { useImageTexture } from './useImageTexture';

export type MediaType = 'image' | 'video';

interface Props {
  src: string;
  mediaType: MediaType;
  // Applied to the decoded image; video-frame textures stay untagged, which
  // matches the raw-write shader convention (see ChannelShift).
  imageColorSpace?: ColorSpace;
  children: (texture: Texture) => ReactNode;
}

// Hosts the ThreeCanvas plus the media-to-texture plumbing so shader
// primitives receive a ready texture regardless of the media type. Videos
// split by environment because useOffthreadVideoTexture throws outside of
// rendering and useVideoTexture needs a mounted preview <Video> element.
export function MediaTextureStage({
  src,
  mediaType,
  imageColorSpace,
  children,
}: Props) {
  const { width, height } = useVideoConfig();
  const { isRendering } = useRemotionEnvironment();
  const videoRef = useRef<HTMLVideoElement>(null);
  const showsPreviewVideo = mediaType === 'video' && !isRendering;

  return (
    <>
      {showsPreviewVideo ? (
        <Video
          ref={videoRef}
          src={src}
          muted
          // Kept in the layout (not display: none) so the browser keeps
          // decoding frames for the texture; the canvas shows the pixels.
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        />
      ) : null}
      <ThreeCanvas width={width} height={height}>
        {mediaType === 'image' ? (
          <ImageTextureScene src={src} colorSpace={imageColorSpace}>
            {children}
          </ImageTextureScene>
        ) : isRendering ? (
          <OffthreadVideoTextureScene src={src}>
            {children}
          </OffthreadVideoTextureScene>
        ) : (
          <PreviewVideoTextureScene videoRef={videoRef}>
            {children}
          </PreviewVideoTextureScene>
        )}
      </ThreeCanvas>
    </>
  );
}

interface SceneChildren {
  children: (texture: Texture) => ReactNode;
}

function ImageTextureScene({
  src,
  colorSpace,
  children,
}: SceneChildren & { src: string; colorSpace?: ColorSpace }) {
  const texture = useImageTexture(
    src,
    colorSpace === undefined ? undefined : { colorSpace }
  );

  if (!texture) {
    return null;
  }

  return <>{children(texture)}</>;
}

function OffthreadVideoTextureScene({
  src,
  children,
}: SceneChildren & { src: string }) {
  const texture = useOffthreadVideoTexture({ src });
  useCommittedTextureRedraw(texture);

  if (!texture) {
    return null;
  }

  return <>{children(texture)}</>;
}

function PreviewVideoTextureScene({
  videoRef,
  children,
}: SceneChildren & { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const texture = useVideoTexture(videoRef);

  if (!texture) {
    return null;
  }

  return <>{children(texture)}</>;
}

// ThreeCanvas advances only when the frame number changes, but the offthread
// frame texture arrives asynchronously after that draw. Hold a delayRender
// across the gap and redraw once the new texture is committed — the
// per-frame variant of the useImageTexture single-shot pattern.
function useCommittedTextureRedraw(texture: Texture | null) {
  const frame = useCurrentFrame();
  const advance = useThree((state) => state.advance);
  const redrawGateRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    redrawGateRef.current = delayRender(
      `Waiting for the media texture of frame ${frame}`
    );

    return () => {
      if (redrawGateRef.current !== null) {
        continueRender(redrawGateRef.current);
        redrawGateRef.current = null;
      }
    };
  }, [frame]);

  useEffect(() => {
    if (!texture) {
      return;
    }
    advance(performance.now());
    if (redrawGateRef.current !== null) {
      continueRender(redrawGateRef.current);
      redrawGateRef.current = null;
    }
  }, [texture, advance]);
}
