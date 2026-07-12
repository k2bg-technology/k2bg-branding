import { Composition, Folder } from 'remotion';
import visualShowcaseSample from '../data/visual-showcase.sample.json';
import { BrandDemo } from './compositions/BrandDemo';
import { getBrandDemoDurationInFrames } from './compositions/BrandDemo/scenes';
import {
  PRIMITIVE_DEMO_DURATION_IN_FRAMES,
  primitiveDemos,
} from './compositions/primitives/demos';
import { VisualShowcase } from './patterns/VisualShowcase';
import {
  calculateVisualShowcaseMetadata,
  getVisualShowcaseDurationInFrames,
} from './patterns/VisualShowcase/timeline';
import { visualShowcaseSchema } from './schemas/visualShowcase';

import './style.css';

const SCENE_WIDTH = 1080;
const SCENE_HEIGHT = 1920;
const SCENE_FPS = 30;
const visualShowcaseDefaultProps =
  visualShowcaseSchema.parse(visualShowcaseSample);

export function RemotionRoot() {
  return (
    <>
      <Folder name="demo">
        <Composition
          id="brand-demo"
          component={BrandDemo}
          width={SCENE_WIDTH}
          height={SCENE_HEIGHT}
          fps={SCENE_FPS}
          durationInFrames={getBrandDemoDurationInFrames()}
        />
      </Folder>
      <Folder name="primitives">
        {primitiveDemos.map((demo) => (
          <Composition
            key={demo.id}
            id={demo.id}
            component={demo.component}
            width={SCENE_WIDTH}
            height={SCENE_HEIGHT}
            fps={SCENE_FPS}
            durationInFrames={PRIMITIVE_DEMO_DURATION_IN_FRAMES}
          />
        ))}
      </Folder>
      <Folder name="patterns">
        <Composition
          id="visual-showcase"
          component={VisualShowcase}
          width={SCENE_WIDTH}
          height={SCENE_HEIGHT}
          fps={SCENE_FPS}
          durationInFrames={getVisualShowcaseDurationInFrames(
            visualShowcaseDefaultProps
          )}
          defaultProps={visualShowcaseDefaultProps}
          schema={visualShowcaseSchema}
          calculateMetadata={calculateVisualShowcaseMetadata}
        />
      </Folder>
    </>
  );
}
