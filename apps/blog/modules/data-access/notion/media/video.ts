import { Entity } from './entity';
import type { MediaVideo } from './types';

export class Video extends Entity implements MediaVideo {
  toObject() {
    return super.toObject();
  }
}
