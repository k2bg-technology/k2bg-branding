import { Composition, Folder } from 'remotion';

import { BrandDemo } from './compositions/BrandDemo';

import './style.css';

const SCENE_WIDTH = 1080;
const SCENE_HEIGHT = 1920;
const SCENE_FPS = 30;

export function RemotionRoot() {
  return (
    <Folder name="demo">
      <Composition
        id="brand-demo"
        component={BrandDemo}
        width={SCENE_WIDTH}
        height={SCENE_HEIGHT}
        fps={SCENE_FPS}
        durationInFrames={450}
      />
    </Folder>
  );
}
